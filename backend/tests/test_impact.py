"""Tests for Exact Mathematical PM2.5 Lung Dose and Emissions Offset Engine."""

import pytest
from fastapi.testclient import TestClient
from backend.app.models.schemas import ActivityExposureInput, TransitSwitchInput
from backend.app.services.math_engine import (
    calculate_lung_dose_for_activity,
    compute_comprehensive_impact,
    BREATHING_RATES_M3_PER_HOUR,
    MASK_EFFICIENCIES,
    CIGARETTE_EQUIVALENT_PM25_UG,
)


def test_breathing_rates_and_mask_efficiencies():
    """Verify parameters adhere to EPA Exposure Factors and certified filtration standards."""
    assert BREATHING_RATES_M3_PER_HOUR["sedentary"] < BREATHING_RATES_M3_PER_HOUR["light"]
    assert BREATHING_RATES_M3_PER_HOUR["light"] < BREATHING_RATES_M3_PER_HOUR["moderate"]
    assert BREATHING_RATES_M3_PER_HOUR["moderate"] < BREATHING_RATES_M3_PER_HOUR["vigorous"]

    assert MASK_EFFICIENCIES["none"] == 0.0
    assert MASK_EFFICIENCIES["cloth"] == 0.30
    assert MASK_EFFICIENCIES["surgical"] == 0.60
    assert MASK_EFFICIENCIES["kn95_n95"] == 0.95
    assert MASK_EFFICIENCIES["papr"] >= 0.99


def test_single_activity_dose_calculation():
    """Verify mathematical calculation: Dose = C * V_e * t * (1 - eta) * DF."""
    # 2 hours jogging (vigorous = 2.8 m3/h) in 200 ug/m3 without mask, DF = 0.50
    # Inhaled = 200 * 2.8 * 2 * 1 = 1120 ug
    # Deposited = 1120 * 0.50 = 560 ug
    activity_no_mask = ActivityExposureInput(
        activity_name="Outdoor Jog",
        duration_hours=2.0,
        pm25_concentration_ug_m3=200.0,
        activity_level="vigorous",
        mask="none",
    )
    res_no_mask = calculate_lung_dose_for_activity(activity_no_mask, deposition_fraction=0.50)
    assert res_no_mask.inhaled_pm25_ug == 1120.0
    assert res_no_mask.deposited_lung_dose_ug == 560.0

    # With N95 (95% filtration)
    # Inhaled = 200 * 2.8 * 2 * (1 - 0.95) = 56 ug
    # Deposited = 56 * 0.50 = 28 ug
    activity_n95 = ActivityExposureInput(
        activity_name="Outdoor Jog with N95",
        duration_hours=2.0,
        pm25_concentration_ug_m3=200.0,
        activity_level="vigorous",
        mask="kn95_n95",
    )
    res_n95 = calculate_lung_dose_for_activity(activity_n95, deposition_fraction=0.50)
    assert res_n95.inhaled_pm25_ug == 56.0
    assert res_n95.deposited_lung_dose_ug == 28.0


def test_comprehensive_impact_and_cigarette_equivalence():
    """Verify dose prevented, cigarette equivalence, and CO2 emissions saved."""
    base = [
        ActivityExposureInput(
            activity_name="Morning Outdoor Walk",
            duration_hours=1.0,
            pm25_concentration_ug_m3=300.0,
            activity_level="moderate",  # 1.5 m3/h
            mask="none",
        )
    ]
    # Inhaled = 300 * 1.5 * 1 = 450 ug -> Deposited = 225 ug

    opt = [
        ActivityExposureInput(
            activity_name="Indoor Treadmill Walk",
            duration_hours=1.0,
            pm25_concentration_ug_m3=20.0,
            activity_level="moderate",
            mask="none",
            is_indoor_filtered=True,
        )
    ]
    # Inhaled = 15 (filtered cap) * 1.5 * 1 = 22.5 ug -> Deposited = 11.25 ug

    transit = TransitSwitchInput(
        distance_km=20.0,
        original_mode="gasoline_car",
        replacement_mode="metro_subway",
    )

    report = compute_comprehensive_impact(
        baseline_activities=base,
        optimized_activities=opt,
        deposition_fraction=0.50,
        transit_switch=transit,
    )

    expected_dose_prevented = 225.0 - 11.25  # 213.75 ug
    assert abs(report.dose_prevented_ug - 213.75) < 0.1
    assert report.dose_reduction_pct > 90.0
    assert abs(report.equivalent_cigarettes_avoided - (213.75 / CIGARETTE_EQUIVALENT_PM25_UG)) < 0.1

    # Gasoline car (172 g/km) to Metro (18 g/km) for 20 km: (172 - 18) * 20 = 3080 g = 3.08 kg CO2
    assert abs(report.co2_prevented_kg - 3.08) < 0.05


def test_impact_api_endpoint(client: TestClient):
    """Verify POST /api/impact/calculate-dose endpoint."""
    payload = {
        "baseline_activities": [
            {
                "activity_name": "Outdoor Commute",
                "duration_hours": 1.5,
                "pm25_concentration_ug_m3=180.0": 180.0,  # field check
                "pm25_concentration_ug_m3": 180.0,
                "activity_level": "moderate",
                "mask": "none",
            }
        ],
        "optimized_activities": [
            {
                "activity_name": "Metro Commute with N95",
                "duration_hours": 1.5,
                "pm25_concentration_ug_m3": 35.0,
                "activity_level": "light",
                "mask": "kn95_n95",
            }
        ],
        "pulmonary_deposition_fraction": 0.50,
    }
    response = client.post("/api/impact/calculate-dose", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["dose_prevented_ug"] > 0
    assert data["equivalent_cigarettes_avoided"] > 0
    assert "formula_breakdown" in data


def test_community_offset_endpoint(client: TestClient):
    """Verify GET /api/impact/community-offset endpoint."""
    response = client.get("/api/impact/community-offset")
    assert response.status_code == 200
    data = response.json()
    assert data["total_active_citizens"] > 0
    assert data["collective_pm25_lung_dose_prevented_grams"] > 0
    assert "Delhi NCR" in data["hotspot_distribution"]
