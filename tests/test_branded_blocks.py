"""Test the branded-block auto-styling shared helper.

Verifies the post-markdown2 transform applies brand CSS classes to common
section patterns so every Money Desk report — regardless of which
specialist wrote it — gets the same professional look.
"""
from __future__ import annotations
import pathlib
import sys
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "extensions" / "money-desk" / "renderers"))
from _branded import apply_branded_blocks  # noqa: E402


class BrandedBlocksTest(unittest.TestCase):

    def test_executive_summary_is_wrapped(self):
        html = "<h2>Executive Summary</h2>\n<p>Renting wins.</p>\n<h2>Detail</h2>\n<p>x</p>"
        out = apply_branded_blocks(html)
        self.assertIn('<div class="executive-summary">', out)
        # The exec-summary div should close before the next h2
        exec_idx = out.find('<div class="executive-summary">')
        next_h2 = out.find("<h2>Detail")
        self.assertLess(exec_idx, next_h2)
        self.assertIn("</div>", out[:next_h2])

    def test_tldr_and_headline_findings_are_wrapped(self):
        for heading in ["TL;DR", "Headline Findings", "At a Glance", "Snapshot", "BLUF"]:
            html = f"<h2>{heading}</h2>\n<p>X</p>\n<h2>Next</h2>"
            out = apply_branded_blocks(html)
            self.assertIn('<div class="executive-summary">', out, f"failed for: {heading}")

    def test_verdict_paragraph_becomes_callout(self):
        html = "<p>Verdict: RENT favored at horizon.</p>"
        out = apply_branded_blocks(html)
        self.assertIn('<div class="callout green">', out)
        self.assertIn("Verdict: RENT favored", out)

    def test_recommendation_paragraph_becomes_callout(self):
        html = "<p><strong>Recommendation:</strong> Refinance now.</p>"
        out = apply_branded_blocks(html)
        self.assertIn('class="callout', out)

    def test_callout_color_classification(self):
        # green for "favored" / 🟢 / ✅
        green = apply_branded_blocks("<p>Verdict: 🟢 strongly favored.</p>")
        self.assertIn("callout green", green)
        # amber for ⚠️ / "caution"
        amber = apply_branded_blocks("<p>Verdict: ⚠️ borderline — proceed with caution.</p>")
        self.assertIn("callout amber", amber)
        # red (default) for 🔴 / no signal
        red = apply_branded_blocks("<p>Verdict: 🔴 do not proceed.</p>")
        self.assertRegex(red, r'<div class="callout">')

    def test_disclaimer_paragraph_gets_note_class(self):
        html = "<p>Disclaimer: This is informational only.</p>"
        out = apply_branded_blocks(html)
        self.assertIn('<p class="note">', out)
        self.assertIn("Disclaimer", out)

    def test_not_professional_advice_footer_gets_note_class(self):
        html = "<p><em>Not professional financial advice. See a CFP.</em></p>"
        out = apply_branded_blocks(html)
        self.assertIn('<p class="note">', out)

    def test_idempotent_on_already_wrapped_content(self):
        html = '<div class="executive-summary"><h2>Executive Summary</h2><p>x</p></div>'
        out = apply_branded_blocks(html)
        # Should not double-wrap
        self.assertEqual(out.count('<div class="executive-summary">'), 1)

    def test_no_match_means_no_change(self):
        html = "<h2>Detailed analysis</h2><p>Just narrative content.</p>"
        out = apply_branded_blocks(html)
        self.assertEqual(out, html)

    def test_executive_summary_is_case_insensitive(self):
        html = "<h2>executive summary</h2>\n<p>x</p>\n<h2>Next</h2>"
        out = apply_branded_blocks(html)
        self.assertIn('<div class="executive-summary">', out)


if __name__ == "__main__":
    unittest.main()
