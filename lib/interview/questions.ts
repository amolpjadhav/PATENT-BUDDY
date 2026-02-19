// ─── Types ────────────────────────────────────────────────────────────────────

export type QuestionType = "text" | "textarea" | "select" | "multiselect";

export interface QuestionOption {
  value: string;
  label: string;
}

/** Show this question only if another question's answer matches one of the given values. */
export interface DependsOnRule {
  key: string;
  values: string[];
}

export interface QuestionValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
}

export interface Question {
  key: string;
  title: string;
  /** The actual question shown large in the main panel */
  prompt: string;
  /** Explanatory text below the prompt */
  helpText: string;
  /** Concrete example shown in a collapsible "See an example" block */
  example?: string;
  type: QuestionType;
  options?: QuestionOption[];
  dependsOn?: DependsOnRule;
  validation?: QuestionValidation;
  /** Textarea row hint */
  rows?: number;
}

export interface InterviewStep {
  id: number;
  title: string;
  description: string;
  questions: Question[];
}

// ─── 20 Questions across 6 Steps ─────────────────────────────────────────────

export const INTERVIEW_STEPS: InterviewStep[] = [
  // ── Step 1: The Invention ──────────────────────────────────────────────────
  {
    id: 0,
    title: "The Invention",
    description: "Start with the basics — what you built and what problem it solves.",
    questions: [
      {
        key: "invention_title",
        title: "Invention Title",
        prompt: "What is the name of your invention?",
        helpText: "A clear, descriptive title that captures the essence of what you created. Avoid vague names like 'Device' or 'System'.",
        example: "Self-Watering Plant Pot System",
        type: "text",
        validation: { required: true, minLength: 3 },
      },
      {
        key: "one_sentence_summary",
        title: "One-Sentence Summary",
        prompt: "Describe your invention in one sentence.",
        helpText: "Imagine explaining it to a friend in 20 words or fewer. Start with 'A [device/method/system] that…'",
        example: "A moisture-sensing plant pot that automatically delivers water to plants when soil humidity drops below a user-set threshold.",
        type: "text",
        validation: { required: true, minLength: 20 },
      },
      {
        key: "problem_statement",
        title: "Problem Statement",
        prompt: "What problem or need does your invention address?",
        helpText: "Describe the pain point, inefficiency, or gap in the market. Be specific about who experiences this problem and how frequently.",
        example: "Home plants frequently die from inconsistent watering. Busy owners forget to water, while overwatering is equally damaging. Existing self-watering solutions lack active soil monitoring and either use passive wicking (imprecise) or require electrical outlets (impractical indoors).",
        type: "textarea",
        rows: 4,
        validation: { required: true, minLength: 50 },
      },
    ],
  },

  // ── Step 2: Prior Art & Novelty ────────────────────────────────────────────
  {
    id: 1,
    title: "Prior Art & Novelty",
    description: "What already exists, and what makes your invention genuinely different?",
    questions: [
      {
        key: "existing_solutions",
        title: "Existing Solutions",
        prompt: "What existing products, patents, or approaches attempt to solve this problem?",
        helpText: "Describe products you've seen, patents you've found, or common techniques. If none are known, write 'None known to inventor.'",
        example: "Existing approaches include: (1) passive wicking pots — no active sensing, cannot adjust to plant needs; (2) drip irrigation systems — require plumbing and electricity; (3) smart plant sensors (e.g., Xiaomi Flower Care) — only monitor, do not water. No product combines passive gravity-fed watering with active capacitive soil sensing in a single self-contained unit.",
        type: "textarea",
        rows: 4,
        validation: {},
      },
      {
        key: "what_is_new",
        title: "Novel Aspects",
        prompt: "What is genuinely new or non-obvious about your invention?",
        helpText: "This is the most critical section. Identify the specific combination of features or approach that hasn't been done before. 'New to me' is not enough — describe what's new in the field.",
        example: "The novel combination of: (1) a capacitive soil moisture sensor embedded directly in the pot wall; (2) a gravity-fed reservoir with a float valve; (3) a passive, electricity-free control mechanism — all integrated into a single, self-contained pot unit requiring no installation, plumbing, or power.",
        type: "textarea",
        rows: 5,
        validation: { required: true, minLength: 50 },
      },
    ],
  },

  // ── Step 3: How It Works ───────────────────────────────────────────────────
  {
    id: 2,
    title: "How It Works",
    description: "The technical core — components, architecture, and complete operation.",
    questions: [
      {
        key: "core_components",
        title: "Core Components",
        prompt: "List and describe each major component of your invention.",
        helpText: "Give each component a unique name you'll use consistently throughout. Briefly describe its function. Format as a bulleted list.",
        example: "- Water reservoir (500 mL, HDPE): stores water supply above plant level\n- Capacitive moisture sensor (embedded in pot wall): reads soil humidity as a 0–100% value\n- Float valve (silicone): opens when moisture < threshold, closes when moisture ≥ threshold\n- Drip tube (3 mm silicone): delivers water from reservoir base to soil\n- Threshold dial (0–100%): user-adjustable set point",
        type: "textarea",
        rows: 6,
        validation: { required: true, minLength: 30 },
      },
      {
        key: "system_overview",
        title: "System Overview",
        prompt: "How does the overall system work? Walk through the complete operating cycle.",
        helpText: "Describe how the components interact. Include both normal operation and what happens at startup or when the reservoir is empty.",
        example: "The user fills the reservoir through a top fill port and sets the threshold dial. The capacitive sensor samples soil moisture every 30 seconds. When moisture drops below the threshold, the float valve lifts, allowing water to flow via gravity through the drip tube into the soil. The valve closes once moisture reaches the threshold. A visual indicator flag rises when the reservoir drops below 10% capacity, prompting refilling.",
        type: "textarea",
        rows: 6,
        validation: { required: true, minLength: 50 },
      },
      {
        key: "main_flow_steps",
        title: "Step-by-Step Process",
        prompt: "If your invention involves a method or process, list the steps in sequence.",
        helpText: "Number each step. Include decision points (if X, then Y). Leave blank if your invention is purely a structural device.",
        example: "1. User fills reservoir to MAX line and sets dial to desired moisture % (e.g., 40%).\n2. Sensor samples soil moisture every 30 seconds.\n3. If moisture reading < dial setting: float valve opens → water flows through drip tube into soil.\n4. Sensor continues sampling. When reading ≥ dial setting: float valve closes.\n5. Steps 2–4 repeat indefinitely.\n6. If reservoir level < 10%: indicator flag rises (mechanical, no power required).",
        type: "textarea",
        rows: 6,
        validation: {},
      },
      {
        key: "alternative_variations",
        title: "Alternative Variations",
        prompt: "What alternative configurations or embodiments of your invention could exist?",
        helpText: "Describe variations that still capture the core idea. These broaden the scope of your patent protection significantly.",
        example: "- Electronic version: replaces float valve with a solenoid valve and uses a microcontroller (Arduino) for threshold logic, adding Bluetooth monitoring\n- Commercial greenhouse version: 10 L reservoir, multi-pot drip network, mountable to standard greenhouse racking\n- Outdoor version: UV-stabilized polypropylene housing, integrated rain sensor to pause watering during rainfall",
        type: "textarea",
        rows: 5,
        validation: {},
      },
    ],
  },

  // ── Step 4: Technical Details ──────────────────────────────────────────────
  {
    id: 3,
    title: "Technical Details",
    description: "Specifications, data flows, edge cases, and failure modes.",
    questions: [
      {
        key: "key_parameters",
        title: "Key Parameters & Specifications",
        prompt: "What are the critical dimensions, values, ranges, or settings?",
        helpText: "Include measurable parameters: sizes, voltages, frequencies, capacities, tolerances, time intervals. Use ranges where exact values vary.",
        example: "Reservoir capacity: 200–1000 mL. Moisture threshold range: 20–80% RH. Sensor sampling interval: 10–60 s (default 30 s). Float valve response time: < 2 s. Drip tube inner diameter: 2–4 mm. Operating temperature: 0–50 °C. Pot diameter compatibility: 10–30 cm.",
        type: "textarea",
        rows: 4,
        validation: {},
      },
      {
        key: "data_inputs_outputs",
        title: "Inputs & Outputs",
        prompt: "What are the inputs to your invention, and what are the outputs or results?",
        helpText: "For physical inventions: materials, forces, fluids, energy. For software/electronic inventions: data types, signals, API responses.",
        example: "Inputs: water (user-supplied via fill port), soil moisture level (sensed by capacitive probe), threshold setting (user-adjusted via dial 0–100%).\nOutputs: water delivered to soil (volume proportional to moisture deficit), mechanical indicator flag (raised when reservoir < 10%), no electrical power consumed.",
        type: "textarea",
        rows: 4,
        validation: {},
      },
      {
        key: "edge_cases_failures",
        title: "Edge Cases & Failure Modes",
        prompt: "What happens in abnormal or boundary situations? How are errors handled?",
        helpText: "Consider: power loss, sensor failure, empty reservoir, overflow, user misuse. Documenting handled failures strengthens the specification.",
        example: "Empty reservoir: float valve closes automatically — no overflow possible, no damage to plant from dry soil beyond what reservoir emptying allows. Sensor disconnection: valve defaults to closed (fail-safe). Overwatering prevention: mechanical float ensures valve cannot supply water beyond reservoir content. Incorrect dial setting: user visible — if plant stays wet dial setting is too high, user can adjust.",
        type: "textarea",
        rows: 4,
        validation: {},
      },
    ],
  },

  // ── Step 5: Value & Context ────────────────────────────────────────────────
  {
    id: 4,
    title: "Value & Context",
    description: "Benefits, real-world use cases, and deployment environment.",
    questions: [
      {
        key: "advantages",
        title: "Advantages & Benefits",
        prompt: "What concrete advantages does your invention provide over existing solutions?",
        helpText: "Quantify where possible ('50% less water usage', 'installs in under 2 minutes'). List distinct advantages separately.",
        example: "- No electricity required: gravity-fed and mechanically controlled — safe near electronics and works during power outages\n- Precision: capacitive sensor gives ±5% accuracy vs. guesswork of manual watering\n- Self-contained: no external hoses, plumbing, or wiring needed\n- Long autonomy: 500 mL reservoir lasts 30 days for average houseplant at 40% threshold\n- Universal fit: works with any pot 10–30 cm diameter",
        type: "textarea",
        rows: 5,
        validation: { required: true, minLength: 30 },
      },
      {
        key: "example_use_case",
        title: "Example Use Case",
        prompt: "Walk through a concrete, real-world scenario of someone using your invention.",
        helpText: "Tell the story of a specific user completing a specific task. This demonstrates practical utility and gives context to the specification.",
        example: "Maria, a frequent business traveler, installs the system in her apartment before a 2-week trip. She fills the 500 mL reservoir, sets the moisture dial to 40%, and departs. During her absence, the system waters her fiddle-leaf fig three times — delivering approximately 30 mL each time the sensor registers below threshold — and the plant is thriving on her return. She refills the reservoir (which is 60% depleted) and continues using the system year-round.",
        type: "textarea",
        rows: 5,
        validation: {},
      },
      {
        key: "user_roles",
        title: "User Roles",
        prompt: "Who uses your invention, and what role does each person play?",
        helpText: "Include end users, operators, installers, administrators. Even 'only the end user' is a valid answer.",
        example: "Primary user: home plant owner — installs the system (no tools required), fills the reservoir, sets the moisture threshold. No other roles. Installation requires no special skills.",
        type: "textarea",
        rows: 3,
        validation: {},
      },
      {
        key: "deployment_environment",
        title: "Deployment Environment",
        prompt: "Where and in what context is your invention used or deployed?",
        helpText: "Describe the physical, digital, or regulatory environment. Include constraints like space, connectivity, climate, power availability.",
        example: "Indoor residential environment. Standard potted plants, 10–30 cm diameter pots. Room temperature (15–30 °C). No electrical outlets required. Works with standard potting soil, cactus mix, and peat-based media. Not suitable for hydroponics or outdoor use in freezing conditions.",
        type: "textarea",
        rows: 3,
        validation: {},
      },
    ],
  },

  // ── Step 6: Compliance & Reference ────────────────────────────────────────
  {
    id: 5,
    title: "Compliance & Reference",
    description: "Safety, performance constraints, drawings, and terminology.",
    questions: [
      {
        key: "security_privacy",
        title: "Security & Privacy Considerations",
        prompt: "Does your invention handle sensitive data, require authentication, or have security implications?",
        helpText: "For software/IoT inventions: describe data storage, transmission encryption, authentication mechanisms. For hardware with no digital component: write 'Not applicable.'",
        example: "Not applicable — the device contains no digital components, stores no user data, has no network connectivity, and presents no cybersecurity surface.",
        type: "textarea",
        rows: 3,
        validation: {},
      },
      {
        key: "performance_constraints",
        title: "Performance Constraints",
        prompt: "Are there minimum performance requirements your invention must meet to be useful?",
        helpText: "Response time, throughput, accuracy, battery life, load capacity, etc. Include the minimum acceptable thresholds.",
        example: "Moisture sensor accuracy: ±10% RH minimum, ±5% preferred. Valve response time: < 5 seconds after threshold crossed. Reservoir minimum capacity: 200 mL (supports at least 7 days for average houseplant). Float valve leak rate: zero (fully sealed when closed).",
        type: "textarea",
        rows: 3,
        validation: {},
      },
      {
        key: "drawings_list",
        title: "Drawings & Figures",
        prompt: "What drawings or diagrams would best illustrate your invention?",
        helpText: "List each figure you could provide (even if not yet drawn). Describe what each would show: perspective views, cross-sections, exploded views, flowcharts, screenshots.",
        example: "FIG. 1 — Perspective view of assembled self-watering pot showing reservoir, dial, and indicator flag\nFIG. 2 — Cross-section through the pot center showing the reservoir, float valve, drip tube, and sensor probe\nFIG. 3 — Exploded assembly view with all components labeled\nFIG. 4 — Flowchart of the moisture-sensing and valve-control logic cycle",
        type: "textarea",
        rows: 4,
        validation: {},
      },
      {
        key: "definitions_glossary",
        title: "Definitions & Glossary",
        prompt: "Define any technical terms, acronyms, or specialized vocabulary used in your description.",
        helpText: "Patent applications benefit from explicit definitions. Include any terms that could be interpreted multiple ways or that you use in a specific sense.",
        example: "Moisture threshold: the minimum acceptable soil relative humidity percentage, adjustable by the user via the threshold dial.\nFloat valve: a passive mechanical valve that opens and closes based on a buoyancy element responding to the water level in the reservoir.\nCapacitive sensor: a sensor that measures the dielectric constant of soil to determine water content, expressed as a percentage of relative humidity.",
        type: "textarea",
        rows: 4,
        validation: {},
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const ALL_QUESTIONS: Question[] = INTERVIEW_STEPS.flatMap((s) => s.questions);

export const REQUIRED_QUESTIONS: Question[] = ALL_QUESTIONS.filter((q) => q.validation?.required);

/** % of required questions answered with minLength satisfied */
export function computeCompleteness(answers: Record<string, string>): {
  answered: number;
  total: number;
  pct: number;
} {
  const total = REQUIRED_QUESTIONS.length;
  const answered = REQUIRED_QUESTIONS.filter((q) => {
    const val = answers[q.key] ?? "";
    return val.trim().length >= (q.validation?.minLength ?? 1);
  }).length;
  return { answered, total, pct: total === 0 ? 100 : Math.round((answered / total) * 100) };
}

/** True if all required questions in this step are answered */
export function isStepComplete(step: InterviewStep, answers: Record<string, string>): boolean {
  return step.questions
    .filter((q) => q.validation?.required)
    .every((q) => {
      const val = answers[q.key] ?? "";
      return val.trim().length >= (q.validation?.minLength ?? 1);
    });
}

/** Count of questions answered (any content) in this step */
export function stepAnsweredCount(step: InterviewStep, answers: Record<string, string>): number {
  return step.questions.filter((q) => (answers[q.key] ?? "").trim().length > 0).length;
}
