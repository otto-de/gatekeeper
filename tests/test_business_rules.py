import unittest
import time
import sys

from app.gates import test_against_global_rules

test_rules = {
    "live": {
        "business_time_mo_to_do": {
            "hours_range": [8, 16],
            "days_range": [0, 3]
        },
        "business_time_fr": {
            "hours_range": [8, 14],
            "days_range": [4, 4]
        },
    },
    "develop": {
        "no_restriction": {
            "hours_range": [0, 24],
            "days_range": [0, 6]
        }
    }
}


class TestBusinessRules(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.maxDiff = None

    def test_global_rules_before(self):
        ur, br = test_against_global_rules(test_rules, "live", time.strptime("7 59 1", "%H %M %w"))
        self.assertFalse(ur)
        self.assertTrue(br)

        ur, br = test_against_global_rules(test_rules, "live", time.strptime("2 22 2", "%H %M %w"))
        self.assertFalse(ur)
        self.assertTrue(br)

        ur, br = test_against_global_rules(test_rules, "live", time.strptime("7 32 5", "%H %M %w"))
        self.assertFalse(ur)
        self.assertTrue(br)

        ur, br = test_against_global_rules(test_rules, "live", time.strptime("0 23 6", "%H %M %w"))
        self.assertFalse(ur)
        self.assertTrue(br)

        ur, br = test_against_global_rules(test_rules, "live", time.strptime("5 53 0", "%H %M %w"))
        self.assertFalse(ur)
        self.assertTrue(br)

    def test_global_rules_for_develop(self):
        ur, br = test_against_global_rules(test_rules, "develop", time.strptime("7 59 1", "%H %M %w"))
        self.assertTrue(ur)
        self.assertFalse(br)

        ur, br = test_against_global_rules(test_rules, "develop", time.strptime("2 22 2", "%H %M %w"))
        self.assertTrue(ur)
        self.assertFalse(br)

        ur, br = test_against_global_rules(test_rules, "develop", time.strptime("7 32 5", "%H %M %w"))
        self.assertTrue(ur)
        self.assertFalse(br)

        ur, br = test_against_global_rules(test_rules, "develop", time.strptime("0 23 6", "%H %M %w"))
        self.assertTrue(ur)
        self.assertFalse(br)

        ur, br = test_against_global_rules(test_rules, "develop", time.strptime("5 53 0", "%H %M %w"))
        self.assertTrue(ur)
        self.assertFalse(br)

    def test_global_rules_after(self):
        ur, br = test_against_global_rules(test_rules, "live", time.strptime("16 01 1", "%H %M %w"))
        self.assertFalse(ur)
        self.assertTrue(br)

        ur, br = test_against_global_rules(test_rules, "live", time.strptime("14 01 5", "%H %M %w"))
        self.assertFalse(ur)
        self.assertTrue(br)

        ur, br = test_against_global_rules(test_rules, "live", time.strptime("18 43 4", "%H %M %w"))
        self.assertFalse(ur)
        self.assertTrue(br)

        ur, br = test_against_global_rules(test_rules, "live", time.strptime("17 01 6", "%H %M %w"))
        self.assertFalse(ur)
        self.assertTrue(br)

        ur, br = test_against_global_rules(test_rules, "live", time.strptime("18 46 0", "%H %M %w"))
        self.assertFalse(ur)
        self.assertTrue(br)

    def test_global_rules_inside(self):
        ur, br = test_against_global_rules(test_rules, "live", time.strptime("14 01 1", "%H %M %w"))
        self.assertTrue(br)
        self.assertTrue(ur)

        ur, br = test_against_global_rules(test_rules, "live", time.strptime("10 59 2", "%H %M %w"))
        self.assertTrue(br)
        self.assertTrue(ur)

        ur, br = test_against_global_rules(test_rules, "live", time.strptime("15 59 4", "%H %M %w"))
        self.assertTrue(br)
        self.assertTrue(ur)

        ur, br = test_against_global_rules(test_rules, "live", time.strptime("13 59 5", "%H %M %w"))
        self.assertTrue(br)
        self.assertTrue(ur)

        ur, br = test_against_global_rules(test_rules, "live", time.strptime("9 46 3", "%H %M %w"))
        self.assertTrue(br)
        self.assertTrue(ur)

    def test_global_rules_weekend(self):
        ur, br = test_against_global_rules(test_rules, "live", time.strptime("10 01 6", "%H %M %w"))
        self.assertFalse(ur)
        self.assertTrue(br)

        ur, br = test_against_global_rules(test_rules, "live", time.strptime("15 45 6", "%H %M %w"))
        self.assertFalse(ur)
        self.assertTrue(br)

        ur, br = test_against_global_rules(test_rules, "live", time.strptime("8 43 0", "%H %M %w"))
        self.assertFalse(ur)
        self.assertTrue(br)

        ur, br = test_against_global_rules(test_rules, "live", time.strptime("13 22 0", "%H %M %w"))
        self.assertFalse(ur)
        self.assertTrue(br)
