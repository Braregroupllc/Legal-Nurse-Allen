// Shared site constants, per-route metadata, and structured data.
// Titles put the keyword first and the brand last, so when Google truncates
// (around 60 characters) it clips the brand rather than the keyword.
// Descriptions target 140-160 characters. See PLAN.md section A2 for the
// keyword-to-page map these were written from.
export const SITE_NAME="Allen Legal Nurse Consultants";
export const SITE_URL="https://allenlegalnurses.com";
export const EMAIL="Bianca@raregroup.llc";
export const LINKEDIN="https://www.linkedin.com/in/innovativebianca/";
export const TURNAROUND="24 to 72 hours";
export const STATES=["Georgia","Florida","North Carolina","Tennessee","South Carolina"];
export const STATES_SENTENCE="Georgia, Florida, North Carolina, Tennessee, and South Carolina";
export const COVERAGE=`Serving attorneys in ${STATES_SENTENCE}, with select engagements available in additional markets.`;

// path -> [title, description]
export const PAGES:Record<string,[string,string]>={
"/":["Medical Record Review for Attorneys","Registered nurse consulting for attorneys in Georgia, Florida, North Carolina, Tennessee and South Carolina. Most reviews delivered in 24 to 72 hours."],
"/services":["Legal Nurse Consulting Services","Medical record review, chronologies, standards-of-care analysis, merit screening, expert witness support and trial preparation for plaintiff and defense teams."],
"/service-areas":["Service Areas: GA, FL, NC, TN, SC","Legal nurse consulting for attorneys in Georgia, Florida, North Carolina, Tennessee and South Carolina, including Atlanta, Tampa, Charlotte and Nashville."],
"/about":["Bianca Allen, MS, BSN, CV-BC, LNC","Bianca Allen, MS, BSN, CV-BC, MEDSURG-BC, CRAT, LNC. More than 15 years in cardiovascular and critical care nursing, applied to medically complex litigation."],
"/faq":["Frequently Asked Questions","What a legal nurse consultant does, how engagements and fees work, which states are served, turnaround times, and how medical records are handled securely."],
"/contact":["Request a Consultation","Begin with a brief, non-confidential email inquiry. Conflict review and a signed agreement are completed before any medical records are received."],
"/process":["How an Engagement Works","Seven steps from first consultation to final report, including conflict check, written scope and fees, secure record transfer, and clinical review."],
"/resources":["Attorney Resources","An attorney guide to the legal nurse consultant role, a medical timeline worksheet, and answers to the questions attorneys ask most before an engagement."],
"/chronology-clinical-issue-map":["Medical Chronology & Issue Map","A searchable, source-linked medical chronology that organizes clinical events, decision points and documentation gaps around the issues counsel defines."],
"/case-screening":["Preliminary Case Screening","An early clinical review clarifying record sufficiency, significant concerns, missing evidence and the questions to resolve before committing to a case."],
"/dme-clinical-observation":["DME & IME Observation","Independent clinical preparation, observation and objective written reporting for attorneys involved in defense or independent medical examinations."],
"/legal-nurse-consultant-guide":["What Does a Legal Nurse Consultant Do?","How nursing expertise clarifies medical evidence, what a legal nurse consultant contributes to a case, and when an attorney should bring one into a matter."],
"/medical-timeline-worksheet":["Medical Timeline Worksheet","A printable worksheet for capturing providers, dates, clinical events, source pages and missing records before a formal medical record review begins."],
"/privacy":["Privacy Policy","How information submitted through the Allen Legal Nurse Consultants website is collected, used, protected and retained, and the choices available to you."],
"/terms":["Terms of Use","Conditions governing use of the Allen Legal Nurse Consultants website, including the absence of a consultant-client relationship and limits on liability."],
"/accessibility":["Accessibility Statement","Our commitment to an inclusive and usable digital experience, the standards applied, known limitations, and how to request assistance or give feedback."],
"/confidentiality":["Confidentiality & HIPAA","How communications, medical records and protected health information are handled, and why records must never be submitted through this public website."]};

export const ROUTES=Object.keys(PAGES);

// The four legal pages are still placeholder text. Indexing placeholder policy
// language on a YMYL site is a quality risk, so they stay out of the index until
// real counsel-reviewed content lands (PLAN.md section C2).
export const NOINDEX=new Set(["/privacy","/terms","/accessibility","/confidentiality"]);

export function metaFor(path:string){
  const p=PAGES[path];
  if(!p)return{title:`Page Not Found | ${SITE_NAME}`,description:"The requested page could not be found."};
  return{title:path==="/"?`${SITE_NAME} | ${p[0]}`:`${p[0]} | ${SITE_NAME}`,description:p[1]};
}

const PERSON={
"@type":"Person",
"@id":`${SITE_URL}/about#bianca-allen`,
name:"Bianca Allen",
honorificSuffix:"MS, BSN, CV-BC, MEDSURG-BC, CRAT, LNC",
jobTitle:"Legal Nurse Consultant",
description:"Registered nurse with more than 15 years of experience across cardiovascular nursing, critical care, medical-surgical nursing and clinical education, working with attorneys on medically complex litigation.",
url:`${SITE_URL}/about`,
sameAs:[LINKEDIN],
knowsAbout:["Medical record review","Medical chronology","Standard of care analysis","Merit screening","Defense medical examination observation","Cardiovascular nursing","Critical care nursing","Medical-surgical nursing","Nursing documentation"],
alumniOf:[
{"@type":"CollegeOrUniversity",name:"Western Governors University"},
{"@type":"CollegeOrUniversity",name:"Post University"},
{"@type":"CollegeOrUniversity",name:"Calhoun Community College"}],
hasCredential:[
{"@type":"EducationalOccupationalCredential",credentialCategory:"degree",name:"Master of Science in Leadership and Management"},
{"@type":"EducationalOccupationalCredential",credentialCategory:"degree",name:"Bachelor of Science in Nursing"},
{"@type":"EducationalOccupationalCredential",credentialCategory:"certification",name:"CV-BC, Cardiac Vascular Nursing Certification"},
{"@type":"EducationalOccupationalCredential",credentialCategory:"certification",name:"MEDSURG-BC, Medical-Surgical Nursing Certification"},
{"@type":"EducationalOccupationalCredential",credentialCategory:"certification",name:"CRAT, Certified Rhythm Analysis Technician"},
{"@type":"EducationalOccupationalCredential",credentialCategory:"certification",name:"LNC, Legal Nurse Consultant"}]};

// Organization-level structured data, rendered on every page. The Person block is
// nested so Google and AI systems can verify who is behind the work, which matters
// more than usual for YMYL (legal and medical) content.
export const ORGANIZATION_LD={
"@context":"https://schema.org",
"@type":"ProfessionalService",
"@id":`${SITE_URL}/#organization`,
name:SITE_NAME,
url:SITE_URL,
email:EMAIL,
description:"Legal nurse consulting for attorneys handling medically complex cases, including medical record review, chronologies, standards-of-care analysis, merit screening, and defense medical examination observation.",
areaServed:STATES.map(name=>({"@type":"State",name})),
knowsAbout:["Medical record review","Medical chronology","Standard of care analysis","Merit screening","Expert witness support","Deposition preparation","Defense medical examination observation","Nursing documentation"],
founder:PERSON,
employee:PERSON,
hasOfferCatalog:{
"@type":"OfferCatalog",
name:"Legal nurse consulting services",
itemListElement:[
["Medical Record Review","Focused clinical review identifying pivotal facts, gaps and inconsistencies in the record."],
["Medical Chronology and Clinical Issue Map","A searchable, source-linked chronology organized around the issues counsel defines."],
["Preliminary Case Screening","Early clinical review of record sufficiency, concerns and missing evidence."],
["Standards of Care Review","Evidence-informed assessment of clinical actions, documentation and professional expectations."],
["Defense Medical Examination Observation","Independent observation and objective written reporting of a defense or independent medical examination."],
["Expert Witness Support","Specialty matching, candidate research and clinical preparation for expert review."]
].map(([name,description])=>({"@type":"Offer",itemOffered:{"@type":"Service",name,description,provider:{"@id":`${SITE_URL}/#organization`}}}))}};

export const PERSON_LD={"@context":"https://schema.org",...PERSON,worksFor:{"@id":`${SITE_URL}/#organization`}};
