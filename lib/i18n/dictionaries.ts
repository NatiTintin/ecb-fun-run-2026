// English is the source of truth / default locale. `th` is typed against
// `Dictionary` (derived from `en`) so TypeScript flags any missing or
// mismatched translation key at compile time.

const en = {
  common: {
    required: 'Required',
    back: 'Back',
    next: 'Next',
    loading: 'Loading...',
    backToHome: 'Back to home',
  },
  nav: {
    staffLogin: 'Staff Login',
  },
  hero: {
    eyebrow: 'Come move, connect, and celebrate with us!',
    title: 'ECB Fun Run 2026',
    dateLine: 'Saturday, 7 November 2026',
    cta: 'Register Now',
    registrationPeriod: 'Registration period: 13 September – 18 October 2026',
    statusOpen: 'Registration Open',
    statusUpcoming: 'Registration Opens Soon',
    statusClosed: 'Registration Closed',
  },
  about: {
    eyebrow: 'Celebrating 60 Years',
    body:
      'Invite a friend, neighbor, or colleague and join us on October 7 at 6:30 AM for the ECB Fun Run! ' +
      'Choose either our 3K or 5K route through Benjakitti Park and run, jog, or walk—solo or together ' +
      'with others.\n\nBefore and after the run, stick around at the start/finish area for morning ' +
      'coffee and light snacks from local vendors, and plenty of time to connect. Not a runner? No ' +
      'problem! Come walk the route or cheer on friends from the community.',
  },
  raceOptions: {
    title: 'Choose Your Distance',
    subtitle: 'Race Options',
    quota: 'Quota',
    remaining: 'spots remaining',
    available: 'Available',
    almostFull: 'Almost Full',
    full: 'FULL',
  },
  howItWorks: {
    title: 'How It Works',
    subtitle: 'From registration to race day',
    steps: [
      { title: 'Register', desc: 'Fill in your details and choose your race category' },
      { title: 'Payment', desc: 'Transfer payment and attach proof of payment' },
      { title: 'Review', desc: 'Our staff review your information and payment' },
      { title: 'Confirmation', desc: 'Once approved, you’ll get a Confirmation Email with a QR Code' },
      { title: 'BIB Collection', desc: 'Show your QR Code on BIB collection day' },
    ],
  },
  footer: {
    contact: 'Questions? Contact us:',
  },
  register: {
    closedTitle: {
      upcoming: 'Registration Opens Soon',
      closed: 'Registration Closed',
    },
    closedBody: {
      upcoming: 'Registration opens on 13 September 2026. Please check back then.',
      closed: 'Registration is now closed. Thank you for your interest in ECB Fun Run 2026.',
    },
    steps: ['Details', 'Race', 'Shirt', 'Health & Consent', 'Payment', 'Review'],
    stepOf: 'Step {current} of {total}',
    details: {
      heading: 'Participant Information',
      subheading: 'Tell us about yourself',
      fullName: 'Full Name',
      fullNamePlaceholder: 'e.g. Jane Smith',
      phone: 'Phone Number',
      phoneHint: 'Thai mobile number, e.g. 081-234-5678',
      email: 'Email',
      emailHint: 'Used to send your registration status and QR Code',
      dateOfBirth: 'Date of Birth',
      dateOfBirthHint: 'Used for accident insurance, and to verify your race category',
      idType: 'ID Document',
      idTypeThai: 'Thai National ID',
      idTypePassport: 'Passport',
      idNumber: 'ID / Passport Number',
      idNumberHintThai: '13-digit Thai National ID number',
      idNumberHintPassport: 'Passport number as shown on your passport',
      identityPurposeNote: 'Your date of birth and ID/passport number are collected solely to arrange accident insurance coverage for race day.',
      errors: {
        fullName: 'Please enter your full name',
        phone: 'Please enter a valid Thai mobile number, e.g. 081-234-5678',
        email: 'Please enter a valid email address',
        DOB_REQUIRED: 'Please enter your date of birth',
        DOB_INVALID: 'Please enter a valid date of birth',
        DOB_FUTURE: 'Date of birth cannot be in the future',
        DOB_UNREALISTIC: 'Please double-check your date of birth',
        ID_REQUIRED: 'Please enter your ID/passport number',
        ID_INVALID_THAI: 'Please enter a valid 13-digit Thai National ID number',
        ID_INVALID_PASSPORT: 'Please enter a valid passport number',
      },
    },
    race: {
      heading: 'Choose Category & Distance',
      subheading: 'Participant Type & Race Distance',
      participantType: 'Participant Type',
      distance: 'Race Distance',
      selectTypeFirst: 'Select Participant Type first',
      errors: {
        participantType: 'Please select a Participant Type',
        distance: 'Please select a Race Distance',
      },
      remainingShort: '{n} spots left',
      registrationFee: 'Registration Fee',
      remaining: 'Remaining',
      spots: 'spots',
    },
    shirt: {
      heading: 'Select Shirt Size',
      subheading: 'Shirt Size Selection',
      warning: 'Please check the Size Guide before choosing your shirt size — size changes may not be possible afterward.',
      showGuide: 'Show Size Guide',
      hideGuide: 'Hide Size Guide',
      size: 'Size',
      chest: 'Chest',
      length: 'Length',
      shirtSize: 'Shirt Size',
      errors: {
        shirtSize: 'Please select a shirt size',
      },
    },
    health: {
      heading: 'Physical Activity Readiness Questionnaire',
      subheading: 'PAR-Q',
      questions: [
        'Has your doctor ever said that you have a heart condition and that you should only do physical activity recommended by a doctor?',
        'Do you feel pain in your chest when you do physical activity?',
        'In the past month, have you had chest pain when you were not doing physical activity?',
        'Do you lose your balance because of dizziness, or do you ever lose consciousness?',
        'Do you have a bone or joint problem (for example, back, knee, or hip) that could be made worse by a change in your physical activity?',
        'Is your doctor currently prescribing you drugs for your blood pressure or heart condition?',
        'Do you know of any other reason why you should not do physical activity?',
      ],
      yes: 'YES',
      no: 'NO',
      warningTitle: 'Based on your answers, please consult a physician before participating in this event or exercising.',
      ack: 'I acknowledge this advice and confirm the health information I provided is accurate.',
      pdpaHeading: 'Personal Data Consent (PDPA)',
      pdpaSubheading: 'You may withdraw your consent through the channels the organizer provides.',
      consentA: {
        title: 'A. Health Information Consent',
        text:
          'I consent to ECB Fun Run collecting, using, and processing my health information and physical ' +
          'readiness data from the PAR-Q for the purpose of safety during event participation.',
      },
      consentB: {
        title: 'B. Marketing & Media Consent',
        text:
          'I consent to the organizer capturing photos or videos of me during the event, and using them for ' +
          'public relations and marketing purposes, such as on Facebook, Instagram, LINE, or the organizer’s ' +
          'other communication channels.',
      },
      consentC: {
        title: 'C. Communication Consent',
        text:
          'I consent to my contact information being stored for the purpose of contacting me about the event, ' +
          'notifying me of my registration status, and reaching me when necessary.',
      },
      iConsent: 'I Consent',
      iDoNotConsent: 'I Do Not Consent',
      declaration:
        'I certify that the information I provided is true, and if I answered “Yes” to any PAR-Q ' +
        'question, I understand I should consult a physician before participating, and I will inform the ' +
        'organizer if my health status changes.',
      errors: {
        answerRequired: 'Please answer this question',
        ackRequired: 'Please confirm you acknowledge this advice',
        healthConsentRequired: 'Please choose a consent option',
        healthConsentMandatory: 'Health data consent is required for safety during event participation',
        marketingConsentRequired: 'Please choose a consent option',
        communicationConsentRequired: 'Please choose a consent option',
        declarationRequired: 'Please confirm the declaration before continuing',
      },
    },
    payment: {
      heading: 'Payment',
      subheading: 'Payment',
      registrationFee: 'Registration Fee',
      bankInfo: 'Bank Transfer Information',
      bank: 'Bank',
      accountName: 'Account Name',
      accountNumber: 'Account Number',
      noBankInfo:
        'Our staff are still preparing the bank transfer details. You can continue registering now and ' +
        'attach payment proof later from your registration status page.',
      slipHeading: 'Payment Slip',
      slipHint: 'JPG, PNG, or PDF, up to 8 MB (you may attach this later)',
      slipTypeError: 'Only JPG, PNG, or PDF files are supported',
      slipSizeError: 'File size must not exceed 8 MB',
      slipReady: 'ready to attach',
    },
    review: {
      heading: 'Review Your Registration',
      subheading: 'Please check your details before submitting',
      participantSection: 'Participant Information',
      fullName: 'Full Name',
      phone: 'Phone Number',
      email: 'Email',
      raceSection: 'Race Entry',
      type: 'Type',
      distance: 'Distance',
      shirtSize: 'Shirt Size',
      fee: 'Registration Fee',
      healthSection: 'Health & Consent',
      parq: 'PAR-Q',
      parqFlagged: 'Has notes (acknowledged)',
      parqClear: 'No concerns',
      healthConsent: 'Health Consent',
      marketingConsent: 'Marketing Consent',
      communicationConsent: 'Communication Consent',
      consented: 'Consented',
      notConsented: 'Not Consented',
      parqSensitiveNote: 'Detailed PAR-Q answers are sensitive health data and are not repeated here.',
      paymentSection: 'Payment',
      slipStatus: 'Payment Proof',
      slipAttached: 'Attached ({name})',
      slipNotAttached: 'Not attached yet — you can attach it later',
      submit: 'Submit Registration',
      submitting: 'Submitting...',
    },
    success: {
      heading: 'Registration Received',
      registrationId: 'Registration ID',
      body:
        'Our staff are reviewing your information and payment proof. Once approved, you will receive a ' +
        'Confirmation Email with a QR Code sent to your registered email.',
      viewStatus: 'View My Registration Status',
      backToAdminList: 'Back to registrations',
    },
  },
  status: {
    heading: 'Registration Status',
    registrationId: 'Registration ID',
    name: 'Name',
    entry: 'Entry',
    shirtSize: 'Shirt Size',
    fee: 'Registration Fee',
    paymentStatus: 'Payment Status',
    registrationStatus: 'Registration Status',
    uploadSlipHeading: 'Upload Payment Slip',
    uploadButton: 'Upload Payment Proof',
    uploading: 'Uploading...',
    uploadSuccess: 'Uploaded successfully, thank you!',
    chooseFileError: 'Please choose a payment proof file',
    qrHeading: 'QR Code for BIB Collection',
    qrInstruction: 'Please show this QR Code on BIB collection day',
    saveQr: 'Save QR Code',
    notFound: 'Registration not found',
  },
};

export type Dictionary = typeof en;

const th: Dictionary = {
  common: {
    required: 'จำเป็นต้องกรอก',
    back: 'ย้อนกลับ',
    next: 'ถัดไป',
    loading: 'กำลังโหลด...',
    backToHome: 'กลับหน้าแรก',
  },
  nav: {
    staffLogin: 'สำหรับเจ้าหน้าที่ / Staff Login',
  },
  hero: {
    eyebrow: 'มาวิ่ง เชื่อมโยง และร่วมฉลองไปด้วยกัน!',
    title: 'ECB Fun Run 2026',
    dateLine: 'วันเสาร์ที่ 7 พฤศจิกายน 2026',
    cta: 'สมัครวิ่งเลย',
    registrationPeriod: 'ช่วงเปิดรับสมัคร: 13 กันยายน – 18 ตุลาคม 2026',
    statusOpen: 'เปิดรับสมัครแล้ว',
    statusUpcoming: 'เร็วๆ นี้จะเปิดรับสมัคร',
    statusClosed: 'ปิดรับสมัครแล้ว',
  },
  about: {
    eyebrow: 'ฉลองครบรอบ 60 ปี',
    body:
      'ชวนเพื่อน เพื่อนบ้าน หรือเพื่อนร่วมงานมาร่วมงาน ECB Fun Run ในวันที่ 7 ตุลาคม เวลา 6:30 น. ' +
      'เลือกวิ่งระยะ 3K หรือ 5K ผ่านสวนเบญจกิติ จะวิ่ง จ๊อกกิ้ง หรือเดิน คนเดียวหรือไปด้วยกันก็ได้\n\n' +
      'ก่อนและหลังการวิ่ง แวะพักที่บริเวณจุดสตาร์ท/เส้นชัย มีกาแฟยามเช้าและของว่างเบาๆ จากร้านค้าท้องถิ่น ' +
      'พร้อมเวลาพูดคุยทำความรู้จักกัน ไม่ได้เป็นนักวิ่งก็ไม่เป็นไร มาเดินตามเส้นทางหรือมาเชียร์เพื่อนๆ ในชุมชนได้เช่นกัน',
  },
  raceOptions: {
    title: 'เลือกระยะการวิ่งของคุณ',
    subtitle: 'Race Options',
    quota: 'จำนวนที่รับ',
    remaining: 'สิทธิ์คงเหลือ',
    available: 'เปิดรับสมัคร',
    almostFull: 'ใกล้เต็มแล้ว',
    full: 'เต็ม',
  },
  howItWorks: {
    title: 'ขั้นตอนการสมัคร',
    subtitle: 'How It Works',
    steps: [
      { title: 'สมัคร', desc: 'กรอกข้อมูลและเลือกประเภทการแข่งขัน' },
      { title: 'ชำระเงิน', desc: 'โอนเงินและแนบหลักฐานการชำระเงิน' },
      { title: 'ตรวจสอบ', desc: 'เจ้าหน้าที่ตรวจสอบข้อมูลและการชำระเงิน' },
      { title: 'ยืนยันการสมัคร', desc: 'เมื่อได้รับการอนุมัติ จะได้รับ Confirmation Email พร้อม QR Code' },
      { title: 'รับ BIB', desc: 'แสดง QR Code ในวันรับ BIB' },
    ],
  },
  footer: {
    contact: 'สอบถามข้อมูลเพิ่มเติม:',
  },
  register: {
    closedTitle: {
      upcoming: 'เร็วๆ นี้จะเปิดรับสมัคร',
      closed: 'ปิดรับสมัครแล้ว',
    },
    closedBody: {
      upcoming: 'ระบบจะเปิดรับสมัครวันที่ 13 กันยายน 2026 กรุณากลับมาใหม่อีกครั้ง',
      closed: 'ขณะนี้ปิดรับสมัครแล้ว ขอบคุณที่ให้ความสนใจ ECB Fun Run 2026',
    },
    steps: ['ข้อมูลผู้สมัคร', 'ประเภทการแข่งขัน', 'ขนาดเสื้อ', 'สุขภาพและความยินยอม', 'ชำระเงิน', 'ตรวจสอบ'],
    stepOf: 'ขั้นตอนที่ {current} จาก {total}',
    details: {
      heading: 'ข้อมูลผู้สมัคร',
      subheading: 'Participant Information',
      fullName: 'ชื่อ-นามสกุล',
      fullNamePlaceholder: 'เช่น สมชาย ใจดี',
      phone: 'เบอร์โทรศัพท์',
      phoneHint: 'รองรับเบอร์มือถือไทย เช่น 081-234-5678',
      email: 'อีเมล',
      emailHint: 'ใช้สำหรับส่งสถานะการสมัครและ QR Code',
      dateOfBirth: 'วันเดือนปีเกิด',
      dateOfBirthHint: 'ใช้สำหรับทำประกันอุบัติเหตุ และตรวจสอบประเภทผู้สมัคร',
      idType: 'ประเภทเอกสาร',
      idTypeThai: 'บัตรประชาชนไทย',
      idTypePassport: 'Passport',
      idNumber: 'เลขบัตรประชาชน / Passport',
      idNumberHintThai: 'เลขบัตรประชาชน 13 หลัก',
      idNumberHintPassport: 'หมายเลข Passport ตามที่ระบุในเล่ม',
      identityPurposeNote: 'วันเดือนปีเกิดและเลขบัตรประชาชน/Passport ถูกเก็บไว้เพื่อจัดทำประกันอุบัติเหตุสำหรับวันแข่งขันเท่านั้น',
      errors: {
        fullName: 'กรุณากรอกชื่อ-นามสกุล',
        phone: 'กรุณากรอกเบอร์โทรศัพท์มือถือไทยให้ถูกต้อง เช่น 081-234-5678',
        email: 'รูปแบบอีเมลไม่ถูกต้อง',
        DOB_REQUIRED: 'กรุณาระบุวันเดือนปีเกิด',
        DOB_INVALID: 'วันเดือนปีเกิดไม่ถูกต้อง',
        DOB_FUTURE: 'วันเกิดต้องไม่ใช่วันในอนาคต',
        DOB_UNREALISTIC: 'กรุณาตรวจสอบวันเดือนปีเกิดอีกครั้ง',
        ID_REQUIRED: 'กรุณากรอกเลขบัตรประชาชนหรือ Passport',
        ID_INVALID_THAI: 'กรุณากรอกเลขบัตรประชาชน 13 หลักให้ถูกต้อง',
        ID_INVALID_PASSPORT: 'กรุณากรอกหมายเลข Passport ให้ถูกต้อง',
      },
    },
    race: {
      heading: 'เลือกประเภทและระยะการวิ่ง',
      subheading: 'Participant Type & Race Distance',
      participantType: 'Participant Type',
      distance: 'Race Distance',
      selectTypeFirst: 'เลือก Participant Type ก่อน',
      errors: {
        participantType: 'กรุณาเลือกประเภทผู้สมัคร',
        distance: 'กรุณาเลือกระยะการวิ่ง',
      },
      remainingShort: 'เหลือ {n} สิทธิ์',
      registrationFee: 'Registration Fee',
      remaining: 'Remaining',
      spots: 'spots',
    },
    shirt: {
      heading: 'เลือกขนาดเสื้อ',
      subheading: 'Shirt Size Selection',
      warning: 'กรุณาตรวจสอบ Size Guide ก่อนเลือกขนาดเสื้อ เนื่องจากอาจไม่สามารถเปลี่ยนขนาดภายหลังได้',
      showGuide: 'แสดง Size Guide',
      hideGuide: 'ซ่อน Size Guide',
      size: 'Size',
      chest: 'รอบอก',
      length: 'ความยาว',
      shirtSize: 'Shirt Size',
      errors: {
        shirtSize: 'กรุณาเลือกขนาดเสื้อ',
      },
    },
    health: {
      heading: 'แบบสอบถามความพร้อมในการออกกำลังกาย',
      subheading: 'Physical Activity Readiness Questionnaire (PAR-Q)',
      questions: [
        'แพทย์เคยบอกว่าท่านเป็นโรคหัวใจ และควรออกกำลังกายตามคำแนะนำของแพทย์เท่านั้นหรือไม่?',
        'ท่านรู้สึกเจ็บหน้าอกขณะออกกำลังกายหรือไม่?',
        'ในเดือนที่ผ่านมา ท่านมีอาการเจ็บหน้าอกขณะที่ไม่ได้ออกกำลังกายหรือไม่?',
        'ท่านเคยเสียการทรงตัวเนื่องจากอาการเวียนศีรษะ หรือเคยหมดสติหรือไม่?',
        'ท่านมีปัญหาเกี่ยวกับกระดูกหรือข้อต่อ เช่น หลัง เข่า หรือสะโพก ที่อาจมีอาการแย่ลงจากการออกกำลังกายหรือไม่?',
        'ปัจจุบันแพทย์สั่งยาให้ท่านเพื่อรักษาความดันโลหิตหรือโรคหัวใจหรือไม่?',
        'ท่านทราบเหตุผลอื่นใดที่ทำให้ท่านไม่ควรออกกำลังกายหรือไม่?',
      ],
      yes: 'ใช่ / YES',
      no: 'ไม่ใช่ / NO',
      warningTitle: 'จากข้อมูลที่ท่านให้ไว้ กรุณาปรึกษาแพทย์ก่อนเข้าร่วมกิจกรรมหรือออกกำลังกาย',
      ack: 'ข้าพเจ้ารับทราบคำแนะนำดังกล่าว และยืนยันว่าข้อมูลสุขภาพที่ให้ไว้เป็นข้อมูลที่ถูกต้อง',
      pdpaHeading: 'ความยินยอมด้านข้อมูลส่วนบุคคล (PDPA)',
      pdpaSubheading: 'ผู้สมัครสามารถถอนความยินยอมได้ตามช่องทางที่ผู้จัดงานกำหนด',
      consentA: {
        title: 'A. Health Information Consent',
        text:
          'ข้าพเจ้ายินยอมให้ ECB Fun Run เก็บรวบรวม ใช้ และประมวลผลข้อมูลสุขภาพและข้อมูลความพร้อมทางร่างกายจาก ' +
          'PAR-Q เพื่อวัตถุประสงค์ด้านความปลอดภัยในการเข้าร่วมกิจกรรม',
      },
      consentB: {
        title: 'B. Marketing & Media Consent',
        text:
          'ข้าพเจ้ายินยอมให้ผู้จัดงานบันทึกภาพถ่ายหรือวิดีโอของข้าพเจ้าระหว่างการจัดกิจกรรม และนำภาพหรือวิดีโอ' +
          'ดังกล่าวไปใช้เพื่อวัตถุประสงค์ด้านการประชาสัมพันธ์และการตลาด เช่น Facebook, Instagram, LINE ' +
          'หรือช่องทางสื่อสารของผู้จัดงาน',
      },
      consentC: {
        title: 'C. Communication Consent',
        text:
          'ข้าพเจ้ายินยอมให้จัดเก็บข้อมูลการติดต่อของข้าพเจ้าเพื่อใช้สำหรับการติดต่อเกี่ยวกับกิจกรรม ' +
          'การแจ้งสถานะการสมัคร และการติดต่อในกรณีจำเป็น',
      },
      iConsent: 'I Consent / ยินยอม',
      iDoNotConsent: 'I Do Not Consent / ไม่ยินยอม',
      declaration:
        'ข้าพเจ้ารับรองว่าข้อมูลที่ให้ไว้เป็นความจริง และหากตอบ "ใช่" ในคำถาม PAR-Q ข้อใดข้อหนึ่ง ' +
        'ข้าพเจ้ารับทราบว่าควรปรึกษาแพทย์ก่อนเข้าร่วมกิจกรรม รวมถึงจะแจ้งผู้จัดงานหากสถานะสุขภาพมีการเปลี่ยนแปลง',
      errors: {
        answerRequired: 'กรุณาตอบคำถามข้อนี้',
        ackRequired: 'กรุณายืนยันว่ารับทราบคำแนะนำ',
        healthConsentRequired: 'กรุณาเลือกตัวเลือกความยินยอม',
        healthConsentMandatory: 'จำเป็นต้องยินยอมให้เก็บข้อมูลสุขภาพเพื่อความปลอดภัยในการเข้าร่วมกิจกรรม',
        marketingConsentRequired: 'กรุณาเลือกตัวเลือกความยินยอม',
        communicationConsentRequired: 'กรุณาเลือกตัวเลือกความยินยอม',
        declarationRequired: 'กรุณายืนยันคำรับรองก่อนดำเนินการต่อ',
      },
    },
    payment: {
      heading: 'ชำระเงิน',
      subheading: 'Payment',
      registrationFee: 'Registration Fee',
      bankInfo: 'ข้อมูลการโอนเงิน / Bank Transfer Information',
      bank: 'ธนาคาร',
      accountName: 'ชื่อบัญชี',
      accountNumber: 'เลขบัญชี',
      noBankInfo:
        'เจ้าหน้าที่กำลังเตรียมข้อมูลบัญชีสำหรับการโอนเงิน กรุณาดำเนินการสมัครต่อได้ก่อน แล้วท่านสามารถแนบ' +
        'หลักฐานการชำระเงินภายหลังผ่านหน้าสถานะการสมัคร',
      slipHeading: 'แนบหลักฐานการโอนเงิน / Payment Slip',
      slipHint: 'รองรับ JPG, PNG, PDF ขนาดไม่เกิน 8 MB (สามารถแนบภายหลังได้)',
      slipTypeError: 'รองรับเฉพาะไฟล์ JPG, PNG หรือ PDF เท่านั้น',
      slipSizeError: 'ขนาดไฟล์ต้องไม่เกิน 8 MB',
      slipReady: 'พร้อมแนบ',
    },
    review: {
      heading: 'ตรวจสอบข้อมูลก่อนสมัคร',
      subheading: 'Review your registration',
      participantSection: 'ข้อมูลผู้สมัคร',
      fullName: 'ชื่อ-นามสกุล',
      phone: 'เบอร์โทรศัพท์',
      email: 'อีเมล',
      raceSection: 'รายการแข่งขัน',
      type: 'ประเภท',
      distance: 'ระยะ',
      shirtSize: 'ขนาดเสื้อ',
      fee: 'ค่าสมัคร',
      healthSection: 'สุขภาพและความยินยอม',
      parq: 'PAR-Q',
      parqFlagged: 'มีข้อควรระวัง (รับทราบแล้ว)',
      parqClear: 'ไม่มีข้อควรระวัง',
      healthConsent: 'Health Consent',
      marketingConsent: 'Marketing Consent',
      communicationConsent: 'Communication Consent',
      consented: 'ยินยอม',
      notConsented: 'ไม่ยินยอม',
      parqSensitiveNote: 'รายละเอียดคำตอบ PAR-Q เป็นข้อมูลสุขภาพที่ละเอียดอ่อน จะไม่แสดงซ้ำในหน้านี้',
      paymentSection: 'การชำระเงิน',
      slipStatus: 'หลักฐานการโอนเงิน',
      slipAttached: 'แนบแล้ว ({name})',
      slipNotAttached: 'ยังไม่ได้แนบ — แนบภายหลังได้',
      submit: 'ยืนยันการสมัคร / Submit',
      submitting: 'กำลังส่งข้อมูล...',
    },
    success: {
      heading: 'ได้รับข้อมูลการสมัครแล้ว',
      registrationId: 'Registration ID',
      body:
        'เจ้าหน้าที่กำลังตรวจสอบข้อมูลและหลักฐานการชำระเงิน เมื่อได้รับการอนุมัติแล้ว ' +
        'ระบบจะส่ง Confirmation Email และ QR Code ไปยัง Email ที่ลงทะเบียนไว้',
      viewStatus: 'ดูสถานะการสมัครของฉัน',
      backToAdminList: 'กลับไปที่รายการผู้สมัคร',
    },
  },
  status: {
    heading: 'สถานะการสมัคร',
    registrationId: 'Registration ID',
    name: 'ชื่อ',
    entry: 'รายการ',
    shirtSize: 'ขนาดเสื้อ',
    fee: 'ค่าสมัคร',
    paymentStatus: 'สถานะการชำระเงิน',
    registrationStatus: 'สถานะการสมัคร',
    uploadSlipHeading: 'Upload Payment Slip',
    uploadButton: 'อัปโหลดหลักฐานการชำระเงิน',
    uploading: 'กำลังอัปโหลด...',
    uploadSuccess: 'อัปโหลดสำเร็จ ขอบคุณค่ะ/ครับ',
    chooseFileError: 'กรุณาเลือกไฟล์หลักฐานการชำระเงิน',
    qrHeading: 'QR Code สำหรับรับ BIB',
    qrInstruction: 'กรุณาแสดง QR Code นี้ในวันรับ BIB',
    saveQr: 'Save QR Code',
    notFound: 'ไม่พบข้อมูลการสมัคร',
  },
};

export const dictionaries = { en, th };
export type Locale = keyof typeof dictionaries;
