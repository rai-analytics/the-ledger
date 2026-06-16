// Sector and Time Capsule Briefings database for The Ledger

const sectorBriefings = {
  // --- ARCHIVE SECTORS ---
  "Pre-Partition Politics": {
    title: "Pre-Partition Politics (1905–1947)",
    overview: "The political struggle for Muslim representation in British India, leading from the partition of Bengal to the ultimate emergence of Pakistan.",
    operative: "Quaid-e-Azam Muhammad Ali Jinnah, Aga Khan III, Nawab Salimullah of Dhaka",
    milestones: [
      "1905: Partition of Bengal by Lord Curzon",
      "1906: Simla Deputation & Founding of the Muslim League",
      "1911: Annulment of the Bengal Partition",
      "1920: Jinnah's resignation from Congress in protest of non-cooperation"
    ]
  },
  "Pre-Partition Reform": {
    title: "Pre-Partition Reform & Education (1858–1898)",
    overview: "The intellectual revival of Indian Muslims post-1857, centered around Sir Syed Ahmad Khan's advocacy for modern scientific education and political neutrality.",
    operative: "Sir Syed Ahmad Khan, Nawab Mohsin-ul-Mulk, Nawab Viqar-ul-Mulk",
    milestones: [
      "1864: Establishment of the Scientific Society in Ghazipur",
      "1875: Launch of the MAO High School in Aligarh",
      "1877: Inauguration of the MAO College Aligarh by Lord Lytton",
      "1886: Founding of the Muhammadan Educational Conference"
    ]
  },
  "Constitutional History": {
    title: "Constitutional Milestones & History",
    overview: "The legal and constitutional evolution of Pakistan, tracing back from British-era reforms to the three post-independence constitutions.",
    operative: "Liaquat Ali Khan, Field Marshal Ayub Khan, Zulfikar Ali Bhutto",
    milestones: [
      "1935: Government of India Act 1935 passed",
      "1949: Objectives Resolution passed by Liaquat Ali Khan",
      "1956: Enactment of Pakistan's first Islamic Constitution",
      "1973: Promulgation of the current bicameral parliamentary Constitution"
    ]
  },
  "Political Alliances": {
    title: "Political Alliances & Accords",
    overview: "Strategic pacts and negotiations between the Muslim League, Indian National Congress, and the British administration.",
    operative: "Muhammad Ali Jinnah, Maulana Mohammad Ali Jauhar, Motilal Nehru",
    milestones: [
      "1916: Lucknow Pact, establishing Hindu-Muslim joint demands",
      "1927: Delhi Proposals, offering to waive separate electorates conditionally",
      "1945: Simla Conference to discuss the Wavell Plan interim council"
    ]
  },
  "National Movements": {
    title: "National Movements & Ideology",
    overview: "The ideological mass movements that defined the two-nation theory and mobilized Muslims for partition.",
    operative: "Allama Iqbal, Choudhary Rahmat Ali, Sher-e-Bangal A.K. Fazlul Huq",
    milestones: [
      "1919: Khilafat Movement launched to protect the Ottoman Caliphate",
      "1930: Allahabad Address by Allama Iqbal proposing a separate state",
      "1933: Coining of the name 'Pakistan' by Choudhary Rahmat Ali",
      "1940: Lahore Resolution presented by A.K. Fazlul Huq"
    ]
  },

  // --- CARTOGRAPHY SECTORS ---
  "Mountain Passes": {
    title: "Topographical Corridors & Passes",
    overview: "Strategic geographic mountain passes cutting through the Karakoram, Himalayas, Hindu Kush, and Toba Kakar ranges.",
    operative: "Border Security Force & Cartographical Survey Division",
    milestones: [
      "Khyber Pass (53 km) connecting Peshawar with Kabul",
      "Bolan Pass connecting Sibi and Quetta in Balochistan",
      "Babusar Pass (4173m) connecting Kaghan with Chilas",
      "Lowari Pass connecting Dir and Chitral via the Hindu Raj range"
    ]
  },
  "Borders": {
    title: "Territorial Boundaries & Borders",
    overview: "Demarcated international boundary lines defining the geopolitical sovereignty of Pakistan.",
    operative: "Sir Mortimer Durand, Sir Cyril Radcliffe, Z.A. Bhutto",
    milestones: [
      "1893: Durand Line established with Afghanistan (2,430 km)",
      "1947: Radcliffe Award partition lines drawn",
      "1963: Sino-Pak Boundary Agreement signed (596 km)",
      "Coastline stretches 1,046 km along the Arabian Sea"
    ]
  },
  "Hydrology": {
    title: "Hydrographic Assets & Hydrology",
    overview: "River systems, dams, and lakes forming the agricultural and energy backbone of Pakistan.",
    operative: "Indus Basin Commissioner & Water Power Development Authority (WAPDA)",
    milestones: [
      "Indus River (3180 km) originating from Lake Mansarovar in Tibet",
      "1967: Mangla Dam constructed on the Jhelum River in Mirpur",
      "1976: Tarbela Dam completed on the Indus River in Haripur",
      "Manchar Lake in Sindh, one of the largest freshwater lakes in Asia"
    ]
  },

  // --- SURVEILLANCE SECTORS ---
  "Global Governance": {
    title: "Global Governance & International Orgs",
    overview: "Intergovernmental alliances and political bodies managing international diplomacy, trade, and legal frameworks.",
    operative: "United Nations (UN), Shanghai Cooperation Organisation (SCO), European Union (EU)",
    milestones: [
      "1945: United Nations founded with 193 current member states",
      "1969: OIC founded in Rabat with 57 current member states",
      "1985: SAARC (8 members) and ECO founded",
      "2001: SCO founded in Beijing for Eurasian security cooperation"
    ]
  },

  // --- LABORATORY SECTORS ---
  "Biochemistry": {
    title: "Biochemical Compounds & Vitamins",
    overview: "Organic compounds and vitamins essential for human metabolic functions, along with their deficiency disorders.",
    operative: "Medical Research Division",
    milestones: [
      "Vitamin A (Retinol) deficiency causes Night Blindness / Xerophthalmia",
      "Vitamin B1 (Thiamine) deficiency causes Beriberi",
      "Vitamin B3 (Niacin) deficiency causes Pellagra",
      "Vitamin C (Ascorbic Acid) deficiency causes Scurvy",
      "Vitamin D (Calciferol) deficiency causes Rickets"
    ]
  },

  // --- CHARTER SECTORS ---
  "Early Battles": {
    title: "Islamic Military Campaigns & Ghazwat",
    overview: "The defensive battles fought by the early Muslim community in Madinah, establishing Islamic sovereignty.",
    operative: "Prophet Muhammad (PBUH), Hazrat Ali (R.A), Hazrat Khalid bin Waleed (R.A)",
    milestones: [
      "2 A.H.: Battle of Badr (313 Muslims defeat 1,000 Quraysh)",
      "3 A.H.: Battle of Uhud fought near Mount Uhud",
      "5 A.H.: Battle of Khandaq (Trench) defended by Hazrat Salman Farsi's strategy",
      "7 A.H.: Battle of Khyber (conquest of Jewish fortresses by Hazrat Ali)"
    ]
  }
};

const timeCapsuleBriefings = {
  "1864": {
    event: "Founding of the Scientific Society in Ghazipur",
    location: "Ghazipur, British India",
    operatives: "Sir Syed Ahmad Khan",
    summary: "Sir Syed Ahmad Khan established the Scientific Society of Aligarh in 1864 in Ghazipur. The mission was to translate Western scientific literature and historical treatises into Urdu. Sir Syed believed that the decline of Indian Muslims was due to their isolation from modern science, and Urdu translations served as the bridge to close this educational gap."
  },
  "1877": {
    event: "Inauguration of the MAO College Aligarh",
    location: "Aligarh, British India",
    operatives: "Sir Syed Ahmad Khan, Lord Lytton (Viceroy)",
    summary: "MAO (Muhammadan Anglo-Oriental) College was inaugurated by Viceroy Lord Lytton on January 8, 1877. Founded by Sir Syed, it combined Western scientific curricula with Islamic education. This college served as the cradle of the Aligarh Movement, creating the elite Muslim graduates who later led the political struggle for Pakistan."
  },
  "1905": {
    event: "Partition of Bengal",
    location: "Bengal Presidency (East Bengal & Assam)",
    operatives: "Lord Curzon (Viceroy)",
    summary: "Lord Curzon partitioned the massive Bengal province in 1905, separating the Muslim-majority East Bengal & Assam from the Hindu-majority West Bengal. While done on administrative grounds, it sparked massive Swadeshi protests from Hindu elites. For Muslims, it created the first major province where they had political weight, marking the birth of modern Muslim political identity."
  },
  "1906": {
    event: "The Simla Deputation & Birth of the Muslim League",
    location: "Simla (Viceroy's Lodge) & Dhaka",
    operatives: "Aga Khan III, Lord Minto, Nawab Salimullah of Dhaka",
    summary: "October 1906: A delegation of 35 prominent Muslim leaders led by Sir Aga Khan III met Viceroy Lord Minto in Simla, demanding separate electorates. In December 1906, the All-India Muslim League was formally launched in Dhaka to protect Muslim interests. This was the opening move of partition politics."
  },
  "1911": {
    event: "Annulment of the Partition of Bengal",
    location: "Delhi Durbar",
    operatives: "King George V, Lord Hardinge",
    summary: "Due to relentless Swadeshi boycotts, the British Government annulled the Partition of Bengal in December 1911 during the Delhi Durbar visited by King George V. This shocked the Muslim community, teaching them that British promises could be broken under pressure and pushing them toward independent political strategy."
  },
  "1916": {
    event: "The Lucknow Pact",
    location: "Lucknow, British India",
    operatives: "Muhammad Ali Jinnah, Bal Gangadhar Tilak",
    summary: "A historic compromise where the Indian National Congress and the Muslim League held a joint session. Under Jinnah's mediation, Congress accepted the Muslim demand for separate electorates in provincial legislatures. Jinnah was hailed as the 'Ambassador of Hindu-Muslim Unity' for this strategic alliance."
  },
  "1919": {
    event: "The Rowlatt Act, Amritsar Massacre & Khilafat Movement",
    location: "Amritsar, Delhi, Bombay",
    operatives: "General Reginald Dyer, Ali Brothers (Maolana Mohammad & Shaukat Ali)",
    summary: "A year of extreme tension. The oppressive Rowlatt Act led to protests, culminating in General Dyer ordering the Jallianwala Bagh massacre in Amritsar. Concurrently, the Ali Brothers launched the Khilafat Movement to protect the Ottoman Caliphate, uniting Hindus and Muslims in anti-British agitation."
  },
  "1927": {
    event: "The Delhi Muslim Proposals",
    location: "Delhi, British India",
    operatives: "Muhammad Ali Jinnah",
    summary: "Muslim leaders met in Delhi and drafted proposals offering to waive separate electorates in exchange for provincial reforms (separating Sindh from Bombay, and reforms in KP/Balochistan). Jinnah was willing to trade separate electorates for actual structural territory, showing his pragmatic negotiation style."
  },
  "1928": {
    event: "The Nehru Report",
    location: "Lucknow & Allahabad",
    operatives: "Motilal Nehru, Jawaharlal Nehru",
    summary: "Drafted by a committee chaired by Motilal Nehru as a counter-proposal to the Simon Commission. It demanded Dominion status but rejected separate electorates and federal autonomy, creating a massive rift. Jinnah declared it the 'parting of ways' between the two communities."
  },
  "1929": {
    event: "Jinnah's Fourteen Points",
    location: "Delhi, British India",
    operatives: "Muhammad Ali Jinnah",
    summary: "In response to the Nehru Report, Jinnah presented his Fourteen Points in March 1929. The points demanded a federal system of government with residuary powers vested in the provinces, separate electorates, and safeguards for Muslim representation in central cabinets. This became the Muslim League's constitutional baseline."
  },
  "1930": {
    event: "Allama Iqbal's Allahabad Address",
    location: "Allahabad, British India",
    operatives: "Dr. Allama Muhammad Iqbal",
    summary: "Allama Iqbal presided over the Muslim League session in December 1930. He delivered the historic vision of an independent, consolidated Muslim state in the northwest of India (Punjab, NWFP, Sindh, Balochistan). This marks the formal conceptualization of the homeland that became Pakistan."
  },
  "1932": {
    event: "The Communal Award",
    location: "London, British Empire",
    operatives: "Ramsay MacDonald (Prime Minister)",
    summary: "British Prime Minister Ramsay MacDonald announced the Communal Award in August 1932. It retained separate electorates for minority communities, including Muslims, Sikhs, and Dalits. Jinnah accepted it despite flaws because it protected the separate electorate shield."
  },
  "1936": {
    event: "Sindh Separated from Bombay",
    location: "Sindh & Bombay Presidency",
    operatives: "Sindh Muslim leaders, Lord Willingdon",
    summary: "On April 1, 1936, Sindh was formally separated from the Bombay Presidency and declared a separate province under the Government of India Act 1935. This fulfilled a long-standing demand of the Delhi Proposals, giving Muslims administrative control over another key province."
  },
  "1939": {
    event: "The Day of Deliverance",
    location: "All-India",
    operatives: "Muhammad Ali Jinnah, Muslim League",
    summary: "In October 1939, Congress ministries resigned across British India in protest against India being dragged into World War II without consultation. On December 22, 1939, Jinnah called on Muslims to observe the Day of Deliverance, celebrating relief from two years of biased Congress rule."
  },
  "1940": {
    event: "The Lahore Resolution (Pakistan Resolution)",
    location: "Minto Park, Lahore",
     operatives: "A.K. Fazlul Huq, Muhammad Ali Jinnah",
    summary: "March 23, 1940: The All-India Muslim League passed a landmark resolution demanding that Muslim-majority zones in the northwest and eastern zones of India be grouped to constitute independent states. Presented by A.K. Fazlul Huq (Sher-e-Bangal), this became the blueprint for the creation of Pakistan."
  },
  "1942": {
    event: "The Cripps Mission",
     location: "Delhi, British India",
    operatives: "Sir Stafford Cripps, Winston Churchill",
    summary: "British minister Sir Stafford Cripps brought draft proposals offering Dominion status and a constitution-making body after World War II, with a clause allowing provinces to opt-out. Jinnah rejected it because it did not explicitly concede the creation of Pakistan, and Congress launched the 'Quit India' movement."
  },
  "1945": {
    event: "The Simla Conference",
    location: "Viceregal Lodge, Simla",
    operatives: "Lord Wavell, Muhammad Ali Jinnah, Abul Kalam Azad",
    summary: "A conference convened by Viceroy Wavell to form an interim Executive Council. Jinnah insisted that all five Muslim members must be nominated by the Muslim League. Congress disagreed, claiming representation of all communities. The conference collapsed, proving the League's veto power."
  },
  "1946": {
    event: "The Cabinet Mission",
    location: "New Delhi, British India",
    operatives: "Pethick-Lawrence, Stafford Cripps, A.V. Alexander",
    summary: "A British delegation proposed a three-tiered federated system (Groups A, B, C) with provincial grouping to keep India united. While the League accepted it conditionally for its grouping feature, Congress's rejection of grouping caused the mission to fail, making partition inevitable."
  },
  "1947": {
    event: "Partition & The Radcliffe Award",
    location: "Punjab, Bengal, New Delhi",
    operatives: "Lord Mountbatten, Sir Cyril Radcliffe",
    summary: "June 3 Plan moved independence forward. On August 14, Pakistan emerged. On August 17, Sir Cyril Radcliffe published the Boundary Commission award. The award gave Gurdaspur and other Muslim-majority enclaves to India, causing severe refugee crises, water disputes, and the Kashmir conflict."
  },
  "1949": {
    event: "Objectives Resolution Passed",
    location: "Constituent Assembly, Karachi",
    operatives: "Liaquat Ali Khan",
     summary: "March 12, 1949: The Constituent Assembly passed the Objectives Resolution, declaring that sovereignty belongs to Allah alone, and that the state will enable Muslims to order their lives in accordance with the Quran and Sunnah. This serves as the preamble to all future constitutions of Pakistan."
  },
  "1956": {
    event: "Enactment of the First Constitution",
    location: "Karachi, Pakistan",
    operatives: "Chaudhry Muhammad Ali, Iskander Mirza",
     summary: "March 23, 1956: Pakistan enacted its first constitution, declaring the country an 'Islamic Republic' and ending its dominion status. Major Iskander Mirza became the first President. The constitution was unicameral but was abrogated only two years later when Mirza declared martial law."
  },
  "1962": {
    event: "The Presidential Constitution of Ayub Khan",
    location: "Rawalpindi, Pakistan",
    operatives: "Field Marshal Ayub Khan",
    summary: "June 8, 1962: President Ayub Khan promulgated a new constitution establishing a Presidential system of government. It eliminated the office of Prime Minister, introduced indirect elections via 'Basic Democracies', and consolidated all executive powers under the President."
  },
  "1973": {
    event: "Promulgation of the Democratic Parliamentary Constitution",
    location: "Islamabad, Pakistan",
    operatives: "Zulfikar Ali Bhutto",
    summary: "August 14, 1973: The National Assembly passed a democratic, bicameral, parliamentary constitution. It declared the Prime Minister as the chief executive, established the Senate (Upper House), and made Islamic provisions (declaring Qadianis as non-Muslims) mandatory. It remains Pakistan's current constitution."
  },

  // --- ISLAMIC YEARS ---
  "2 A.H.": {
    event: "The Battle of Badr",
    location: "Wells of Badr, Arabia",
    operatives: "Prophet Muhammad (PBUH)",
    summary: "Fought in Ramadan 2 A.H. (624 A.D.). A Muslim force of 313 defeated a heavily armed Quraysh army of 1,000. By securing the wells of Badr, the Muslims controlled the water, outmaneuvering the enemy. It was the first major military victory in Islamic history."
  },
  "3 A.H.": {
    event: "The Battle of Uhud",
    location: "Mount Uhud near Madinah",
    operatives: "Prophet Muhammad (PBUH), Hamza bin Abdul-Muttalib (R.A)",
    summary: "Fought in Shawwal 3 A.H. (625 A.D.). 700 Muslims fought 3,000 Quraysh. Archers left their posts at the pass prematurely, allowing Khalid bin Waleed (then a Quraysh commander) to launch a surprise flank attack, resulting in severe Muslim losses, including Hazrat Hamza's martyrdom."
  },
  "5 A.H.": {
    event: "The Battle of Khandaq (Trench)",
    location: "Outskirts of Madinah",
    operatives: "Prophet Muhammad (PBUH), Hazrat Salman Farsi (R.A)",
    summary: "Fought in Shawwal 5 A.H. (627 A.D.). Hazrat Salman Farsi (R.A) suggested digging a deep trench around Madinah. This unexpected defensive tactic stalled the 10,000-strong confederate siege (Ahzab), which eventually broke due to cold weather and internal division."
  },
  "7 A.H.": {
    event: "The Battle of Khyber",
    location: "Khyber Oasis, Arabia",
    operatives: "Prophet Muhammad (PBUH), Hazrat Ali (R.A)",
    summary: "Fought in Muharram 7 A.H. (628 A.D.). Fought against the fortified Jewish strongholds of Khyber. Hazrat Ali (R.A) was given the banner, broke through the gate, and conquered the heavily fortified Qamus Fort, ending the threat from the northern border."
  },
  "8 A.H.": {
    event: "Conquest of Makkah & Battle of Mu'tah",
    location: "Makkah & Mu'tah (Jordan)",
    operatives: "Prophet Muhammad (PBUH), Hazrat Khalid bin Waleed (R.A)",
    summary: "Ramadan 8 A.H. (629 A.D.): Prophet Muhammad entered Makkah with 10,000 men. It was a bloodless victory; general amnesty was declared, and idols in the Kaabah were shattered. Earlier in the year, Hazrat Khalid bin Waleed saved the Muslim army from Byzantine forces at Mu'tah, earning the title 'Saifullah'."
  }
};

const pastPaperBriefings = {
  "Deputy Accountant - Treasury Department (2025)": {
    title: "Deputy Accountant (2025) — Finance & Treasury Dept",
    department: "Finance Department (Punjab Treasury)",
    syllabus: "80% Professional Subjects (Financial Accounting, Auditing, Costing, Commercial Law), 20% General Ability (Math, English, GK, IT).",
    focus: "Double-entry rules, BRS, Accounting Concepts, Ratio Analysis, Audit Standards (ISA 315).",
    reddington_story: "Ah, the 2025 Deputy Accountant exam. Treasury Department. A critical posting, my friend. Whoever controls the ledger controls the purse strings. The PPSC loves to test double-entry rules and audit standards here. If you know the difference between a cash discount and an accrual, you're halfway to securing the station. Let's see if you can balance the books."
  },
  "Deputy Accountant - Treasury Department (2019)": {
    title: "Deputy Accountant (2019) — Finance & Treasury Dept",
    department: "Finance Department (Punjab Treasury)",
    syllabus: "80% Professional Subjects (Financial Accounting, Auditing, Costing, Commercial Law), 20% General Ability (Math, English, GK, IT).",
    focus: "Straight-line depreciation, Cash accounting, Internal audit mechanisms, Prime cost, Sales ledger controls.",
    reddington_story: "The 2019 paper was a classic. The examiners leaned heavily on depreciation methods and internal audits. In our line of work, we call that assessing the leak before it sinks the boat. Make sure your math is tight."
  },
  "Sub-Inspector - Punjab Police (2025)": {
    title: "Sub-Inspector (2025) — Punjab Police Department",
    department: "Punjab Police",
    syllabus: "40% IT & Computer Skills, 40% English Language (Grammar & Vocab), 20% General Knowledge.",
    focus: "MS Word, PowerPoint, Excel shortcuts, active/passive voice, direct/indirect speech, prepositions, and basic science.",
    reddington_story: "Punjab Police Sub-Inspector. A field investigator needs English to read the transcripts and IT to track the IP addresses. If you fail the computer section, you're back on the beat. Pay attention to the details."
  },
  "Sub-Inspector - Punjab Police (2023)": {
    title: "Sub-Inspector (2023) — Punjab Police Department",
    department: "Punjab Police",
    syllabus: "40% IT, 40% English, 20% General Knowledge.",
    focus: "Operating systems, hardware basics, English vocabulary, synonyms, and everyday science questions.",
    reddington_story: "The 2023 paper was direct but punishing. The computer science questions focused heavily on network protocols and system structures. I once had to bypass a system using the exact same protocols they test here."
  },
  "Sub-Inspector - Punjab Police (2021)": {
    title: "Sub-Inspector (2021) — Punjab Police Department",
    department: "Punjab Police",
    syllabus: "40% IT, 40% English, 20% General Knowledge.",
    focus: "MS Office 365, grammar rules, idioms, and Pakistan affairs.",
    reddington_story: "2021 was a year of transition. The PPSC introduced more practical IT questions. If you don't know how to merge cells in Excel, they won't trust you with a case file. Focus on the MS Office section."
  },
  "Assistant - S&GAD (2024)": {
    title: "Assistant (2024) — Services & General Administration",
    department: "Services & General Administration Department (S&GAD)",
    syllabus: "100% General Ability (Pakistan Studies, Islamic Studies, Geography, Science, Current Affairs, English, Math).",
    focus: "Constitutional history (1973 Constitution), cabinet missions, key geographic coordinates, current world leaders.",
    reddington_story: "S&GAD. The nerve center of the Punjab bureaucracy. Every file passes through these offices. The 2024 paper tested constitutional history and geography. Knowing who drafted which bill is how you navigate the corridors of power."
  },
  "Assistant - S&GAD (2022)": {
    title: "Assistant (2022) — Services & General Administration",
    department: "Services & General Administration Department (S&GAD)",
    syllabus: "100% General Ability.",
    focus: "Pre-partition history, Islamic history, international organizations, and vocabulary.",
    reddington_story: "S&GAD 2022. A paper full of traps. The questions on international alliances and pre-partition pacts require absolute precision. One slip, and you're out of the running."
  },
  "Assistant - S&GAD (2020)": {
    title: "Assistant (2020) — Services & General Administration",
    department: "Services & General Administration Department (S&GAD)",
    syllabus: "100% General Ability.",
    focus: "Nehru Report, Jinnah's Fourteen Points, basic arithmetic, and everyday science.",
    reddington_story: "2020 was a standard S&GAD paper, but the focus on early constitutional drafts like the Nehru Report was heavy. In our business, you must always study the history of negotiations before entering the room."
  },
  "Junior Clerk - Board of Revenue (2024)": {
    title: "Junior Clerk (2024) — Board of Revenue",
    department: "Board of Revenue (Punjab)",
    syllabus: "60% Language (English, Urdu), 40% GK and Basic Math.",
    focus: "Urdu grammar, direct/indirect narration, fraction mathematics, and basic computer terminology.",
    reddington_story: "Board of Revenue. They keep the land records, my friend. The 2024 junior clerk exam is all about accuracy in language and basic arithmetic. If you can't translate a document or balance a column, the land records will quickly fall into chaos."
  },
  "Junior Clerk - Board of Revenue (2023)": {
    title: "Junior Clerk (2023) — Board of Revenue",
    department: "Board of Revenue (Punjab)",
    syllabus: "60% Language (English, Urdu), 40% GK and Basic Math.",
    focus: "Urdu literature, English vocabulary, basic percentages, and Excel shortcuts.",
    reddington_story: "The 2023 clerk paper. Don't underestimate it. Basic math and language skills are what keep an office running. A good clerk is worth ten bad directors."
  },
  "Junior Clerk - Board of Revenue (2021)": {
    title: "Junior Clerk (2021) — Board of Revenue",
    department: "Board of Revenue (Punjab)",
    syllabus: "60% Language (English, Urdu), 40% GK and Basic Math.",
    focus: "General knowledge, basic biology, everyday science, and spelling checks.",
    reddington_story: "2021 Board of Revenue. Basic science and general knowledge were key here. A clerk who understands biology is less likely to poison the director's tea. Pay attention to the science section."
  },
  "Lecturer (General Knowledge) - Higher Education Department (2023)": {
    title: "Lecturer GK (2023) — Higher Education Department",
    department: "Higher Education Department (HED)",
    syllabus: "20% General Knowledge (compulsory part of the subject specialist exam).",
    focus: "Islamic history, Caliphate details, geography, and current affairs.",
    reddington_story: "Lecturer GK 2023. This is for the academics. The PPSC loves to throw in obscure historical facts about early Islamic battles and world borders. If you don't know who defended which fort, you'll be teaching school children instead of graduates."
  },
  "Lecturer (General Knowledge) - Higher Education Department (2022)": {
    title: "Lecturer GK (2022) — Higher Education Department",
    department: "Higher Education Department (HED)",
    syllabus: "20% General Knowledge.",
    focus: "Aligarh movement, Ghazipur scientific society, Simla delegation, and classical literature.",
    reddington_story: "The 2022 paper focused heavily on the educational reforms of Sir Syed and Bengali Muslim leaders. It's a reminder that the pen is often mightier than the sword, provided you have the right ink."
  },
  "Assistant Director - Anti-Corruption Establishment (2025)": {
    title: "Assistant Director (2025) — Anti-Corruption Establishment",
    department: "Anti-Corruption Establishment (ACE) Punjab",
    syllabus: "100% General Ability with a strong focus on law, investigations, and security affairs.",
    focus: "Border agreements, geopolitical passes, international tribunals (ICJ), and current regional security.",
    reddington_story: "Assistant Director, Anti-Corruption. The hunters of the hunters. The 2025 paper tested international law and borders. If you don't understand how a treaty works at The Hague, how do you expect to track money hidden in offshore accounts?"
  },
  "Inspector - Anti-Corruption Establishment (2023)": {
    title: "Inspector (2023) — Anti-Corruption Establishment",
    department: "Anti-Corruption Establishment (ACE) Punjab",
    syllabus: "100% General Ability, investigation techniques, and logical reasoning.",
    focus: "Durand line history, Sino-Pak border agreement, basic science, and general current affairs.",
    reddington_story: "Inspector ACE. The field officers. You need to know the geography of smuggling routes and border lines. If you don't know the exact length of the Durand Line, the local smugglers will drive circles around your patrols."
  },
  "Tehsil Municipal Officer - Local Government Department (2024)": {
    title: "Tehsil Municipal Officer (2024) — Local Government Dept",
    department: "Local Government & Community Development",
    syllabus: "100% General Ability with emphasis on municipal management, geography, and administrative history.",
    focus: "River systems, canal structures, local current affairs, and everyday chemistry.",
    reddington_story: "TMO. The local administrators. You run the town, clean the canals, and pave the roads. The 2024 paper tested hydrology and river lengths. If you don't know how the Indus flows, you'll flood the town before your first budget is approved."
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { sectorBriefings, timeCapsuleBriefings, pastPaperBriefings };
}
