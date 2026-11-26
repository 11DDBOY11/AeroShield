"""Scientific and Mathematical Engine for AeroShield AI.

Implements rigorous physical formulas for:
1. Inhaled PM2.5 lung dose and pulmonary deposition.
2. Low-emission transit carbon and particulate offset.
3. Air Changes per Hour (ACH) & Corsi-Rosenthal Box CADR modeling.
4. Atmospheric boundary layer and thermal inversion strength metrics.
"""

from typing import List, Dict, Any, Tuple
import math
from backend.app.models.schemas import (
    ActivityExposureInput,
    TransitSwitchInput,
    ActivityDoseBreakdown,
    LungDoseResponse,
)

# -----------------------------------------------------------------------------
# Ventilation Breathing Rates (m3/hour) based on EPA Exposure Factors Handbook
# -----------------------------------------------------------------------------
BREATHING_RATES_M3_PER_HOUR = {
    "sedentary": 0.45,   # Sleep, resting, seated TV/desk
    "light": 0.75,       # Office work, walking indoors, cooking
    "moderate": 1.50,    # Brisk walking, commuting, cleaning, stairs
    "vigorous": 2.80,    # Jogging, outdoor sports, cycling uphill, heavy physical labor
}

# -----------------------------------------------------------------------------
# Mask Inward Leakage / Filtration Efficiencies (Fraction 0.0 to 1.0)
# -----------------------------------------------------------------------------
MASK_EFFICIENCIES = {
    "none": 0.00,
    "cloth": 0.30,        # ~30% filtration of PM2.5
    "surgical": 0.60,     # ~60% filtration (including fit leakage)
    "kn95_n95": 0.95,     # >= 95% certified tight-seal protection
    "papr": 0.999,        # >= 99.9% HEPA powered air purifying respirator
}

# -----------------------------------------------------------------------------
# Vehicle Emission Factors (per passenger-km or vehicle-km)
# -----------------------------------------------------------------------------
# CO2 in grams per km; PM2.5 (exhaust + brake/tire wear) in grams per km
EMISSION_FACTORS = {
    "gasoline_car": {"co2_g_per_km": 172.0, "pm25_g_per_km": 0.045},
    "diesel_suv": {"co2_g_per_km": 235.0, "pm25_g_per_km": 0.078},
    "motorcycle": {"co2_g_per_km": 94.0, "pm25_g_per_km": 0.026},
    "auto_rickshaw": {"co2_g_per_km": 88.0, "pm25_g_per_km": 0.038},
    "metro_subway": {"co2_g_per_km": 18.0, "pm25_g_per_km": 0.002},
    "electric_bus": {"co2_g_per_km": 34.0, "pm25_g_per_km": 0.005},
    "bicycle": {"co2_g_per_km": 0.0, "pm25_g_per_km": 0.000},
    "walking": {"co2_g_per_km": 0.0, "pm25_g_per_km": 0.000},
    "electric_scooter": {"co2_g_per_km": 15.0, "pm25_g_per_km": 0.003},
}

# Micrograms of inhaled PM2.5 equivalent to 1 active cigarette
# Berkeley Earth scientific standard: ~22 ug inhaled PM2.5 equivalent to 1 cigarette
CIGARETTE_EQUIVALENT_PM25_UG = 22.0


def calculate_lung_dose_for_activity(
    activity: ActivityExposureInput,
    deposition_fraction: float = 0.50,
) -> ActivityDoseBreakdown:
    """Calculate inhaled and pulmonary deposited PM2.5 dose for a single activity slot.

    Formula:
      Inhaled Dose (ug) = C_pm25 (ug/m3) * V_e (m3/h) * Time (h) * (1 - Mask_efficiency)
      Deposited Dose (ug) = Inhaled Dose (ug) * Deposition_Fraction
    """
    vent_rate = BREATHING_RATES_M3_PER_HOUR.get(activity.activity_level, 0.75)
    mask_eff = MASK_EFFICIENCIES.get(activity.mask, 0.0)

    # If indoor and filtered, assume HEPA filtration achieves clean indoor standard (<= 15 ug/m3)
    concentration = activity.pm25_concentration_ug_m3
    if activity.is_indoor_filtered:
        concentration = min(concentration, 15.0)

    # Inhaled mass in micrograms
    inhaled_ug = concentration * vent_rate * activity.duration_hours * (1.0 - mask_eff)
    # Deposited mass in deep alveolar regions of lungs
    deposited_ug = inhaled_ug * deposition_fraction

    return ActivityDoseBreakdown(
        activity_name=activity.activity_name,
        duration_hours=round(activity.duration_hours, 2),
        breathing_rate_m3_h=round(vent_rate, 2),
        mask_efficiency_pct=round(mask_eff * 100.0, 1),
        pm25_concentration=round(concentration, 1),
        inhaled_pm25_ug=round(inhaled_ug, 2),
        deposited_lung_dose_ug=round(deposited_ug, 2),
    )


def compute_comprehensive_impact(
    baseline_activities: List[ActivityExposureInput],
    optimized_activities: List[ActivityExposureInput],
    deposition_fraction: float = 0.50,
    transit_switch: TransitSwitchInput = None,
) -> LungDoseResponse:
    """Calculates comparative lung dose reduction, cigarette equivalence, and CO2 offset."""
    baseline_breakdown = [
        calculate_lung_dose_for_activity(act, deposition_fraction)
        for act in baseline_activities
    ]
    optimized_breakdown = [
        calculate_lung_dose_for_activity(act, deposition_fraction)
        for act in optimized_activities
    ]

    total_base_inhaled = sum(b.inhaled_pm25_ug for b in baseline_breakdown)
    total_base_dose = sum(b.deposited_lung_dose_ug for b in baseline_breakdown)

    total_opt_inhaled = sum(o.inhaled_pm25_ug for o in optimized_breakdown)
    total_opt_dose = sum(o.deposited_lung_dose_ug for o in optimized_breakdown)

    dose_prevented = max(0.0, total_base_dose - total_opt_dose)
    reduction_pct = (
        (dose_prevented / total_base_dose * 100.0) if total_base_dose > 0 else 0.0
    )

    cigarettes_avoided = dose_prevented / CIGARETTE_EQUIVALENT_PM25_UG

    # Transit emissions calculations
    co2_saved_kg = 0.0
    pm25_emissions_g = 0.0
    if transit_switch and transit_switch.distance_km > 0:
        base_factors = EMISSION_FACTORS.get(transit_switch.original_mode, EMISSION_FACTORS["gasoline_car"])
        opt_factors = EMISSION_FACTORS.get(transit_switch.replacement_mode, EMISSION_FACTORS["metro_subway"])

        delta_co2_g = (base_factors["co2_g_per_km"] - opt_factors["co2_g_per_km"]) * transit_switch.distance_km
        delta_pm_g = (base_factors["pm25_g_per_km"] - opt_factors["pm25_g_per_km"]) * transit_switch.distance_km

        co2_saved_kg = max(0.0, delta_co2_g / 1000.0)
        pm25_emissions_g = max(0.0, delta_pm_g)

    formula_str = (
        "Lung Dose (ug) = sum_i( C_pm25_i * V_E(activity_i) * t_i * (1 - eta_mask_i) ) * DF\n"
        f"Where DF = {deposition_fraction:.2f} (ICRP 66 pulmonary deposition model). "
        f"1 Cigarette Equivalent = {CIGARETTE_EQUIVALENT_PM25_UG} ug inhaled PM2.5."
    )

    return LungDoseResponse(
        baseline_inhaled_ug=round(total_base_inhaled, 2),
        baseline_lung_dose_ug=round(total_base_dose, 2),
        optimized_inhaled_ug=round(total_opt_inhaled, 2),
        optimized_lung_dose_ug=round(total_opt_dose, 2),
        dose_prevented_ug=round(dose_prevented, 2),
        dose_reduction_pct=round(reduction_pct, 1),
        equivalent_cigarettes_avoided=round(cigarettes_avoided, 2),
        co2_prevented_kg=round(co2_saved_kg, 3),
        pm25_emissions_prevented_g=round(pm25_emissions_g, 3),
        formula_breakdown=formula_str,
        baseline_details=baseline_breakdown,
        optimized_details=optimized_breakdown,
    )


def calculate_cadr_and_ach(
    room_volume_m3: float,
    fan_free_air_cfm: float = 1800.0,
    number_of_filters: int = 4,
    has_cardboard_shroud: bool = True,
    merv_rating: int = 13,
) -> Tuple[float, float, float]:
    """Calculates Clean Air Delivery Rate (CADR in CFM) and Air Changes per Hour (ACH).

    Based on UC Davis / Corsi-Rosenthal Box aerosol testing physics:
    - 4-filter configuration with MERV 13 produces lower face velocity (~50-80 fpm),
      yielding higher single-pass filtration efficiency and lower pressure drop.
    - Cardboard shroud reduces blade-tip circular recirculation, boosting forward CFM by 35-40%.
    """
    # Base filter single-pass efficiency for PM2.5
    single_pass_eff = 0.85 if merv_rating >= 13 else 0.65

    # Multi-filter area factor: 4 or 5 filters drastically reduces resistance
    filter_area_factor = 0.28 if number_of_filters >= 4 else (0.24 if number_of_filters >= 2 else 0.15)

    base_flow = fan_free_air_cfm * filter_area_factor

    # Shroud boost: 38% increase in effective forward volumetric throughput
    shroud_multiplier = 1.38 if has_cardboard_shroud else 1.0

    effective_cfm = base_flow * shroud_multiplier
    cadr_cfm = effective_cfm * single_pass_eff

    # Convert room volume m3 to cubic feet
    room_volume_cuft = room_volume_m3 * 35.3147
    # Air Changes per Hour = (CADR_cfm * 60) / Room_cuft
    ach = (cadr_cfm * 60.0) / room_volume_cuft if room_volume_cuft > 0 else 0.0

    # Minimum recommended CADR for 4 ACH
    target_cadr_for_4ach = (4.0 * room_volume_cuft) / 60.0

    return round(cadr_cfm, 1), round(ach, 2), round(target_cadr_for_4ach, 1)


def calculate_inversion_strength(
    surface_temp_c: float,
    temp_at_boundary_c: float,
    boundary_layer_height_m: float,
    wind_speed_kmh: float,
) -> Tuple[float, str, float]:
    """Computes Inversion Strength Index (0 to 100) and thermal lapse rate dT/dz (°C/km).

    Inversion exists when dT/dz > 0 (temperature increases with altitude).
    Strong inversion + low boundary layer (< 300m) + stagnant wind (< 5 km/h) = extreme trap.
    """
    height_km = max(0.05, boundary_layer_height_m / 1000.0)
    delta_t = temp_at_boundary_c - surface_temp_c
    lapse_rate_c_per_km = delta_t / height_km  # Positive means inversion

    # Base score from lapse rate
    if lapse_rate_c_per_km > 0:
        # Stronger inversion cap
        inversion_factor = min(60.0, lapse_rate_c_per_km * 10.0)
    else:
        # Normal lapse rate (atmosphere cools with height)
        inversion_factor = max(0.0, 10.0 + lapse_rate_c_per_km * 2.0)

    # Boundary layer compression penalty (shallow boundary layer traps all ground emissions)
    if boundary_layer_height_m <= 150:
        pbl_penalty = 35.0
    elif boundary_layer_height_m <= 300:
        pbl_penalty = 25.0
    elif boundary_layer_height_m <= 600:
        pbl_penalty = 15.0
    elif boundary_layer_height_m <= 1000:
        pbl_penalty = 5.0
    else:
        pbl_penalty = 0.0

    # Wind stagnation penalty
    if wind_speed_kmh < 3.0:
        wind_penalty = 15.0
    elif wind_speed_kmh < 8.0:
        wind_penalty = 8.0
    elif wind_speed_kmh < 15.0:
        wind_penalty = 2.0
    else:
        wind_penalty = -10.0  # Strong winds disperse particulate

    isi = max(0.0, min(100.0, inversion_factor + pbl_penalty + wind_penalty))

    if isi >= 75.0:
        status = "hazardous"
    elif isi >= 40.0:
        status = "caution"
    else:
        status = "safe"

    return round(isi, 1), status, round(lapse_rate_c_per_km, 2)
