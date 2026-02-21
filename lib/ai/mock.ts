/**
 * Mock AI provider — used for local development when no API key is set.
 * Returns structurally valid placeholder responses so the app can be tested
 * end-to-end without making real API calls or incurring costs.
 *
 * DISCLAIMER: Outputs from this provider are placeholder text only.
 * They do NOT constitute legal advice of any kind.
 */
import type { AIProvider, GenerateTextOptions, GenerateTextResult } from "./provider";

// ─── Mock sections JSON ───────────────────────────────────────────────────────

const MOCK_SECTIONS_JSON = JSON.stringify({
  sections: {
    TITLE: "Automated Soil-Moisture-Responsive Plant Watering System",
    BACKGROUND: [
      "The present invention relates to automated plant care systems, and more particularly to self-contained, electricity-free devices for delivering water to potted plants in response to measured soil moisture levels.",
      "Maintaining consistent soil moisture is critical to healthy plant growth. Under-watering causes wilting and root damage, while over-watering promotes root rot and fungal disease. The problem is especially acute for busy plant owners who travel frequently or maintain large indoor plant collections.",
      "Existing solutions fail to address this need adequately. Passive wicking pots deliver water at a fixed rate regardless of soil moisture, leading to inconsistent hydration. Automated irrigation systems require plumbing connections and electrical power, making them impractical for typical indoor potted plants. Manual watering remains the most common approach despite its unreliability.",
      "There remains a need for a self-contained, electricity-free plant watering device that responds dynamically to real soil moisture conditions without requiring user intervention beyond periodic reservoir refilling.",
    ].join("\n\n"),
    SUMMARY: [
      "The present invention provides a self-watering plant pot system that automatically delivers water to soil when moisture drops below a user-defined threshold, without requiring electrical power or external plumbing connections.",
      "In one aspect, the invention comprises a water reservoir, a capacitive soil moisture sensor, and a gravity-fed float valve integrated into a single self-contained housing. The system operates passively — the sensor monitors moisture continuously and the valve opens only when the measured value falls below the threshold set by the user via an adjustment dial.",
      "Advantages include precision moisture control (±5% relative humidity), a 30-day autonomous operating period per reservoir fill for average houseplants, zero electricity consumption, and compatibility with standard potted plant containers from 10 cm to 30 cm in diameter.",
    ].join("\n\n"),
    DRAWINGS: [
      "FIG. 1 is a perspective view of the assembled self-watering plant pot system showing the reservoir, threshold dial, and low-water indicator.",
      "FIG. 2 is a cross-sectional view through the central axis of the device illustrating the reservoir (100), float valve assembly (104), drip tube (106), and sensor probe (108).",
      "FIG. 3 is an exploded assembly view with all components labeled and reference numerals assigned.",
      "FIG. 4 is a flowchart illustrating the moisture-sensing and valve-control operating cycle.",
    ].join("\n"),
    DETAILED_DESC: [
      "Referring now to the drawings, FIG. 1 illustrates the assembled self-watering plant pot system (10) according to a preferred embodiment of the present invention. The system (10) comprises a plant pot body (50), a water reservoir (100), a capacitive moisture sensor (102), a float valve assembly (104), a drip tube (106), a sensor probe (108), a threshold dial (110), and a low-water indicator flag (112).",
      "The plant pot body (50) is formed from high-density polyethylene (HDPE) and is configured to receive a standard potted plant root ball. The body (50) defines an inner cavity for soil and outer annular chamber that houses the reservoir (100). The reservoir (100) has a nominal capacity of 500 mL and is accessible via a top fill port (114) sealed with a removable cap.",
      "The capacitive moisture sensor (102) comprises a pair of stainless steel electrodes embedded in the inner wall of the pot body (50). The sensor (102) measures the dielectric constant of the surrounding soil, which varies with water content, and outputs a voltage signal proportional to soil relative humidity (0%–100%).",
      "The float valve assembly (104) is positioned at the base of the reservoir (100). The assembly (104) includes a buoyancy float (116) mechanically linked to a silicone valve seat (118). When soil moisture detected by the sensor (102) falls below the threshold value set by the threshold dial (110), a mechanical linkage (120) disengages the float (116) from its closed position, allowing water to flow from the reservoir (100) through the drip tube (106) into the soil. When moisture reaches the threshold, the linkage (120) returns the float (116) to the closed position.",
      "The threshold dial (110) is located on the exterior of the pot body (50) and is rotatable through a range corresponding to soil moisture setpoints of 20% to 80% relative humidity. A position indicator on the dial (110) aligns with graduated markings on the pot body (50) to allow the user to set the desired moisture level visually.",
      "The low-water indicator flag (112) is a mechanical flag mounted on a float arm within the reservoir (100). When the reservoir water level drops below 10% of capacity (approximately 50 mL), the flag (112) rises above the rim of the pot body (50), providing a visible indication that refilling is required. No electrical power is consumed by this mechanism.",
      "In operation, the user fills the reservoir (100) through the fill port (114) and sets the threshold dial (110) to the desired soil moisture level. The sensor (102) samples moisture at 30-second intervals. When the sampled value is below the threshold, the float valve assembly (104) opens and water flows via gravity through the drip tube (106) into the soil. The valve (104) closes when the sensor (102) reports that the threshold has been reached or exceeded. This cycle repeats indefinitely until the reservoir (100) is exhausted.",
      "Alternative embodiments include an electronic version substituting the mechanical linkage (120) with a microcontroller and solenoid valve, enabling smartphone notifications and precise volumetric dosing. A commercial greenhouse embodiment provides a 10 L reservoir and a multi-outlet drip network serving up to six pots simultaneously from a single reservoir.",
    ].join("\n\n"),
    ABSTRACT:
      "A self-watering plant pot system comprises a water reservoir, a capacitive soil moisture sensor, and a gravity-fed float valve integrated in a self-contained housing. The system monitors soil humidity at regular intervals and automatically delivers water from the reservoir to the soil when measured humidity falls below a user-set threshold. No electrical power is required. A low-water indicator flag provides a visible alert when the reservoir requires refilling. The system accommodates plant pots 10 cm to 30 cm in diameter and provides up to 30 days of autonomous operation per 500 mL reservoir fill under average watering conditions. (MOCK OUTPUT — for development only. Not legal advice.)",
  },
});

// ─── Mock claims plain text ───────────────────────────────────────────────────

const MOCK_CLAIMS_TEXT = `\
1. A self-watering plant pot system comprising: a reservoir configured to store a supply of water; a capacitive soil moisture sensor configured to measure soil humidity and output a corresponding signal; a float valve assembly configured to selectively release water from the reservoir to the soil in response to the signal; and a threshold dial configured to allow a user to set a moisture threshold value, wherein the float valve assembly opens when the measured humidity is below the threshold value and closes when the measured humidity reaches or exceeds the threshold value.

2. The system of claim 1, wherein the capacitive soil moisture sensor comprises a pair of electrodes embedded in a wall of a plant pot body.

3. The system of claim 1, wherein the float valve assembly comprises a buoyancy float mechanically linked to a valve seat, and a mechanical linkage operably connecting the capacitive soil moisture sensor output to the buoyancy float.

4. The system of claim 1, further comprising a drip tube fluidly connecting the reservoir to a soil-contact outlet within the plant pot body.

5. The system of claim 1, further comprising a low-water indicator flag configured to rise above a rim of the plant pot body when a water level in the reservoir falls below a predetermined minimum level.

6. The system of claim 1, wherein the reservoir has a capacity in the range of 200 mL to 1000 mL.

7. The system of claim 1, wherein the threshold dial is adjustable through a range of moisture threshold values from 20% to 80% relative humidity.

8. The system of claim 1, wherein the system operates without electrical power.

9. A method of automatically watering a potted plant, comprising: storing water in a reservoir associated with a plant pot; measuring soil humidity within the plant pot at regular sampling intervals using a capacitive sensor; comparing the measured humidity to a user-set threshold value; and releasing water from the reservoir to the soil when the measured humidity is below the threshold value.

10. The method of claim 9, wherein releasing water comprises opening a gravity-fed float valve assembly in response to the comparison.

(MOCK CLAIMS — for development only. Not legal advice. Consult a registered patent attorney before filing.)`;

// ─── Mock provider ────────────────────────────────────────────────────────────

const MOCK_USAGE = { promptTokens: 500, completionTokens: 1000, totalTokens: 1500, model: "mock" };

export class MockAIProvider implements AIProvider {
  async generateText({ prompt }: GenerateTextOptions): Promise<GenerateTextResult> {
    // Detect sections vs. claims request by prompt content
    const isSectionsRequest =
      prompt.includes('"sections"') ||
      (prompt.includes("TITLE") && prompt.includes("BACKGROUND") && prompt.includes("JSON"));

    return {
      content: isSectionsRequest ? MOCK_SECTIONS_JSON : MOCK_CLAIMS_TEXT,
      usage: MOCK_USAGE,
    };
  }
}
