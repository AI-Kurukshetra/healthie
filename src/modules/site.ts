export const trustedLogos = ["Northstar Clinic", "Beacon Health", "Everwell Care", "Summit Medical", "VitalSpring", "Harbor Labs"];

export const platformStats = [
  { value: "4.9/5", label: "Average provider satisfaction" },
  { value: "32%", label: "Faster patient follow-up" },
  { value: "24/7", label: "Patient access to care plans" }
];

export const featureCards = [
  {
    title: "Unified client records",
    description: "Keep appointments, notes, prescriptions, and documents in a single longitudinal chart."
  },
  {
    title: "Scheduling that feels operational",
    description: "Manage visit demand, provider calendars, statuses, and virtual care links from one surface."
  },
  {
    title: "Engagement workflows",
    description: "Support messaging, follow-ups, reminders, and notifications without switching products."
  }
];

export const capabilityCards = [
  {
    title: "Care delivery",
    items: ["Patient onboarding", "Visit scheduling", "Telehealth links", "Role-aware access"]
  },
  {
    title: "Clinical workflow",
    items: ["SOAP notes", "Prescriptions", "Medical records", "Structured history"]
  },
  {
    title: "Operations",
    items: ["Audit trails", "API routes", "Supabase RLS", "Realtime-ready messaging"]
  }
];

export const howItWorksSteps = [
  {
    step: "01",
    title: "Launch your workspace",
    description: "Configure branding-neutral templates, auth flows, and secure data access in a few minutes."
  },
  {
    step: "02",
    title: "Coordinate patient care",
    description: "Book appointments, capture notes, and maintain medication workflows across the same dashboard."
  },
  {
    step: "03",
    title: "Keep teams aligned",
    description: "Use notifications, messaging, and analytics surfaces to keep care operations moving."
  }
];

export const testimonialCards = [
  {
    quote: "The dashboard gives our providers a cleaner picture of appointments, records, and patient communication.",
    author: "Clinical operations lead",
    role: "Multi-specialty practice"
  },
  {
    quote: "Patients get a calmer experience because messaging, visit history, and prescriptions are all in one place.",
    author: "Digital health manager",
    role: "Virtual-first clinic"
  },
  {
    quote: "The layout feels like a healthcare product, not a generic admin panel. That matters for adoption.",
    author: "Founder",
    role: "Care enablement startup"
  }
];

export const pricingTiers = [
  {
    name: "Starter",
    price: 49,
    description: "For solo clinicians validating patient workflows.",
    features: ["Patient portal", "Appointments", "Medical records", "Secure messaging"]
  },
  {
    name: "Growth",
    price: 149,
    description: "For small care teams coordinating scheduling and documentation.",
    features: ["Everything in Starter", "Clinical notes", "Prescriptions", "Operations dashboard"],
    featured: true
  },
  {
    name: "Scale",
    price: 349,
    description: "For organizations standardizing care delivery across teams.",
    features: ["Everything in Growth", "Analytics views", "Admin workflows", "API-first architecture"]
  }
];

export const footerColumns = [
  {
    title: "Platform",
    links: [
      { href: "/features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/about", label: "About" }
    ]
  },
  {
    title: "Company",
    links: [
      { href: "/contact", label: "Contact" },
      { href: "/login", label: "Login" },
      { href: "/signup", label: "Signup" }
    ]
  }
];
