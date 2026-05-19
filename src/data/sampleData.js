// sampleData.js
//
// WHY THIS FILE EXISTS:
// Right now we have no backend or database.
// So we store fake data here to build and test the UI.
// Later, when the backend is ready, we DELETE this file
// and replace it with real API calls.

export const DEPARTMENTS = [
  { id: 1, name: "Sales & Leasing",      hod: "Mohammed Al Rashid", learners: 18, courses: 6, male: 12, female: 6, hours: 240, score: 4.3 },
  { id: 2, name: "Property Management",  hod: "Sara Al Kaabi",      learners: 14, courses: 5, male: 8,  female: 6, hours: 196, score: 4.1 },
  { id: 3, name: "Finance",              hod: "Ahmed Hassan",        learners: 10, courses: 4, male: 6,  female: 4, hours: 160, score: 4.6 },
  { id: 4, name: "Human Resources",      hod: "Fatima Al Mansoori",  learners: 8,  courses: 5, male: 3,  female: 5, hours: 140, score: 4.4 },
  { id: 5, name: "IT & Digital",         hod: "Khalid Nasser",       learners: 12, courses: 7, male: 9,  female: 3, hours: 210, score: 4.7 },
];

export const COURSES = [
  { id: 1, title: "Real Estate Law & Compliance",      institute: "RERA Academy",          trainer: "Dr. Omar Khalid",    status: "Completed", enrolled: 12, cost: 15000, hours: 24, days: 3, dept: "Sales & Leasing",   stars: 4.5 },
  { id: 2, title: "Customer Experience Excellence",    institute: "Service Pro UAE",        trainer: "Lisa Chen",          status: "Completed", enrolled: 20, cost: 12000, hours: 16, days: 2, dept: "All",               stars: 4.2 },
  { id: 3, title: "Financial Modeling for Real Estate",institute: "CFI Institute",          trainer: "Ahmed Saleh",        status: "Ongoing",   enrolled: 8,  cost: 18000, hours: 24, days: 3, dept: "Finance",           stars: 4.8 },
  { id: 4, title: "Leadership & Management Skills",    institute: "Harvard Business Online",trainer: "Dr. Sarah Williams", status: "Pending",   enrolled: 15, cost: 22000, hours: 32, days: 4, dept: "Human Resources",   stars: 0   },
  { id: 5, title: "Cybersecurity Fundamentals",        institute: "CompTIA UAE",            trainer: "Raj Patel",          status: "Pending",   enrolled: 10, cost: 9500,  hours: 16, days: 2, dept: "IT & Digital",      stars: 0   },
];

export const LEARNERS = [
  { id: 1, empId: "RAK-001", name: "Noura Al Hamdan",   gender: "Female", dept: "Sales & Leasing",   email: "noura@rakprop.ae", designation: "Senior Sales Manager", nationality: "Emirati",    status: "Active",   courseIds: [1, 2], cost: 2250 },
  { id: 2, empId: "RAK-002", name: "James Mitchell",    gender: "Male",   dept: "Finance",            email: "james@rakprop.ae", designation: "Financial Analyst",    nationality: "British",    status: "Active",   courseIds: [2, 3], cost: 1875 },
  { id: 3, empId: "RAK-003", name: "Layla Bint Khalid", gender: "Female", dept: "Human Resources",    email: "layla@rakprop.ae", designation: "HR Business Partner",  nationality: "Emirati",    status: "Active",   courseIds: [2, 4], cost: 2100 },
  { id: 4, empId: "RAK-004", name: "Carlos Mendes",     gender: "Male",   dept: "IT & Digital",       email: "carlos@rakprop.ae",designation: "IT Manager",           nationality: "Portuguese", status: "Active",   courseIds: [2, 5], cost: 1650 },
  { id: 5, empId: "RAK-005", name: "Aisha Farooq",      gender: "Female", dept: "Property Management",email: "aisha@rakprop.ae", designation: "Property Coordinator", nationality: "Pakistani",  status: "Resigned", courseIds: [1],    cost: 1250 },
];

export const TRAINERS = [
  {
    id: 1,
    name: "Dr. Omar Khalid",
    institute: "RERA Academy",
    expertise: ["Real Estate Law", "RERA Compliance", "Property Regulations"],
    rating: 4.5,
    phone: "+971 50 123 4567",
    email: "omar@rera.ae",
    courseIds: [1],
    type: "External",
    bio: "Certified RERA instructor with 15 years of experience in UAE real estate law and regulatory compliance.",
  },
  {
    id: 2,
    name: "Lisa Chen",
    institute: "Service Pro UAE",
    expertise: ["Customer Experience", "NPS Methodology", "Service Design"],
    rating: 4.2,
    phone: "+971 55 987 6543",
    email: "lisa@servicepro.ae",
    courseIds: [2],
    type: "External",
    bio: "CX strategist who has worked with Fortune 500 companies across the GCC to redesign customer service journeys.",
  },
  {
    id: 3,
    name: "Ahmed Saleh",
    institute: "CFI Institute",
    expertise: ["Financial Modeling", "DCF Analysis", "Real Estate Valuation"],
    rating: 4.8,
    phone: "+971 50 456 7890",
    email: "ahmed@cfi.ae",
    courseIds: [3],
    type: "External",
    bio: "CFA holder and MBA graduate from LBS. Has modeled over AED 2 billion in UAE real estate transactions.",
  },
  {
    id: 4,
    name: "Dr. Sarah Williams",
    institute: "Harvard Business Online",
    expertise: ["Leadership Development", "OKRs", "Executive Coaching"],
    rating: 4.7,
    phone: "+1 617 555 0192",
    email: "sarah@hbo.edu",
    courseIds: [4],
    type: "External",
    bio: "Harvard-affiliated executive coach who has trained over 2,000 managers across the Middle East.",
  },
  {
    id: 5,
    name: "Raj Patel",
    institute: "CompTIA UAE",
    expertise: ["Cybersecurity", "Network Security", "IT Risk Management"],
    rating: 4.3,
    phone: "+971 50 789 0123",
    email: "raj@comptia.ae",
    courseIds: [5],
    type: "Internal",
    bio: "CompTIA certified security professional with 10 years experience securing enterprise networks across the UAE.",
  },
];