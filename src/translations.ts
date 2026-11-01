export type Language = 'en' | 'hi' | 'bn';

export const LANGUAGES: { code: Language; label: string; nativeName: string; flag: string }[] = [
  { code: 'en', label: 'English', nativeName: 'English', flag: '🌐' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'bn', label: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
];

export const translations = {
  en: {
    brand: 'Weather GPT',
    tagline: 'Personalized weather intelligence',
    eyebrow: 'AI-powered weather guidance',
    heroTitle: 'Weather insights tailored for your work.',
    heroSubtitle:
      'Select your profession and receive specialized weather guidance, risk alerts, and AI-powered planning recommendations designed around your daily decisions.',
    back: '← Back',
    profile: 'Profile',
    liveWeather: 'Live weather',
    dashboard: 'dashboard',
    live: 'Live',
    searchPlaceholder: (city: string) => `Search city or region (e.g. ${city}, London...)`,
    update: 'Update',
    fetchingWeather: 'Fetching weather data...',
    weatherWillAppear: 'Weather will appear here.',
    feelsLike: 'Feels like',
    precipitation: 'Precipitation',
    precipAbbr: 'precip',
    humidity: 'Humidity',
    wind: 'Wind',
    pressure: 'Pressure',
    sunrise: 'Sunrise',
    sunset: 'Sunset',
    aiInsightsModel: 'AI insights model',
    risk: 'Risk',
    riskLow: 'Low',
    riskModerate: 'Moderate',
    riskHigh: 'High',
    riskSevere: 'Severe',
    operationalRecommendation: 'AI Operational Recommendation',
    assistant: 'Assistant',
    ragChatbot: 'RAG chatbot',
    chatInitial: 'Hi! I can help with weather guidance, operational planning, and risk-based advice.',
    chatPlaceholderFarmer: 'Ask the farmer weather assistant...',
    chatPlaceholderGeneral: 'Ask about weather, risk, or planning...',
    send: 'Send',
    sending: 'Sending...',
    noticeModal: {
      tag: 'Platform Notice',
      title: 'Notice: Farmer Mode Active',
      message:
        'This website is currently functional for only farmers. The rest of the occupations are under development and will be updated in the future.',
      farmerStatus: 'Active & Functional',
      otherStatus: 'Under Development',
      confirmBtn: 'Got it, Continue',
      closeButton: 'Close notice',
    },
    occupations: {
      farmer: {
        title: 'Farmer',
        subtitle: 'Crop and field intelligence',
      },
      marine: {
        title: 'Fisherman / Marine',
        subtitle: 'Ocean safety and sea state',
      },
      aviation: {
        title: 'Aviation Personnel',
        subtitle: 'Flight readiness and visibility',
      },
      others: {
        title: 'Others',
        subtitle: 'Daily weather guidance',
      },
    },
  },
  hi: {
    brand: 'वेदर जीपीटी',
    tagline: 'व्यक्तिगत मौसम बुद्धिमत्ता',
    eyebrow: 'एआई-संचालित मौसम मार्गदर्शन',
    heroTitle: 'आपके कार्य के अनुसार मौसम की सटीक अंतर्दृष्टि।',
    heroSubtitle:
      'अपना पेशा चुनें और अपने दैनिक निर्णयों के अनुकूल विशेष मौसम मार्गदर्शन, जोखिम अलर्ट और एआई-संचालित योजना अनुशंसाएं प्राप्त करें।',
    back: '← वापस',
    profile: 'प्रोफ़ाइल',
    liveWeather: 'लाइव मौसम',
    dashboard: 'डैशबोर्ड',
    live: 'लाइव',
    searchPlaceholder: (city: string) => `शहर या क्षेत्र खोजें (उदा. ${city}, मुंबई...)`,
    update: 'अपडेट करें',
    fetchingWeather: 'मौसम का डेटा लाया जा रहा है...',
    weatherWillAppear: 'मौसम की जानकारी यहाँ दिखाई देगी।',
    feelsLike: 'महसूस होता है',
    precipitation: 'वर्षा (Precipitation)',
    precipAbbr: 'वर्षा',
    humidity: 'आर्द्रता (नमी)',
    wind: 'हवा की गति',
    pressure: 'वायुदाब',
    sunrise: 'सूर्योदय',
    sunset: 'सूर्यास्त',
    aiInsightsModel: 'एआई अंतर्दृष्टि मॉडल',
    risk: 'जोखिम',
    riskLow: 'कम',
    riskModerate: 'मध्यम',
    riskHigh: 'उच्च',
    riskSevere: 'गंभीर',
    operationalRecommendation: 'एआई परिचालन अनुशंसा',
    assistant: 'सहायक',
    ragChatbot: 'आरएजी चैटबॉट',
    chatInitial: 'नमस्ते! मैं मौसम मार्गदर्शन, कार्य योजना और जोखिम आधारित सलाह में आपकी सहायता कर सकता हूँ।',
    chatPlaceholderFarmer: 'किसान मौसम सहायक से पूछें...',
    chatPlaceholderGeneral: 'मौसम, जोखिम या योजना के बारे में पूछें...',
    send: 'भेजें',
    sending: 'भेजा जा रहा है...',
    noticeModal: {
      tag: 'महत्वपूर्ण सूचना',
      title: 'सूचना: केवल किसानों के लिए सक्रिय',
      message:
        'यह वेबसाइट वर्तमान में केवल किसानों के लिए कार्यात्मक है। शेष सभी व्यवसाय अभी निर्माणाधीन हैं और इन्हें भविष्य में अपडेट किया जाएगा।',
      farmerStatus: 'सक्रिय एवं कार्यात्मक',
      otherStatus: 'निर्माणाधीन',
      confirmBtn: 'समझ गया, आगे बढ़ें',
      closeButton: 'सूचना बंद करें',
    },
    occupations: {
      farmer: {
        title: 'किसान',
        subtitle: 'फसल और खेत की विशेष जानकारी',
      },
      marine: {
        title: 'मछुआरे / समुद्री दल',
        subtitle: 'समुद्री सुरक्षा और समुद्र की स्थिति',
      },
      aviation: {
        title: 'विमानन कर्मी',
        subtitle: 'उड़ान तत्परता और दृश्यता रिपोर्ट',
      },
      others: {
        title: 'अन्य नागरिक',
        subtitle: 'दैनिक मौसम मार्गदर्शन व योजना',
      },
    },
  },
  bn: {
    brand: 'ওয়েদার জিপিটি',
    tagline: 'ব্যক্তিগত আবহাওয়া গোয়েন্দা তথ্য',
    eyebrow: 'এআই-চালিত আবহাওয়া নির্দেশিকা',
    heroTitle: 'আপনার কাজের উপযোগী আবহাওয়ার অন্তর্দৃষ্টি।',
    heroSubtitle:
      'আপনার পেশা বেছে নিন এবং আপনার দৈনন্দিন সিদ্ধান্তের ওপর ভিত্তি করে বিশেষ আবহাওয়া নির্দেশিকা, ঝুঁকি সতর্কতা এবং এআই-চালিত পরিকল্পনার সুপারিশ গ্রহণ করুন।',
    back: '← পিছনে',
    profile: 'প্রোফাইল',
    liveWeather: 'লাইভ আবহাওয়া',
    dashboard: 'ড্যাশবোর্ড',
    live: 'লাইভ',
    searchPlaceholder: (city: string) => `শহর বা অঞ্চল খুঁজুন (যেমন ${city}, কলকাতা...)`,
    update: 'আপডেট করুন',
    fetchingWeather: 'আবহাওয়ার তথ্য আনা হচ্ছে...',
    weatherWillAppear: 'আবহাওয়ার তথ্য এখানে দেখা যাবে।',
    feelsLike: 'অনুভূত তাপমাত্রা',
    precipitation: 'বৃষ্টিপাত (Precipitation)',
    precipAbbr: 'বৃষ্টি',
    humidity: 'আর্দ্রতা',
    wind: 'বাতাস',
    pressure: 'বায়ুচাপ',
    sunrise: 'সূর্যোদয়',
    sunset: 'সূর্যাস্ত',
    aiInsightsModel: 'এআই অন্তর্দৃষ্টি মডেল',
    risk: 'ঝুঁকি',
    riskLow: 'কম',
    riskModerate: 'মাঝারি',
    riskHigh: 'উচ্চ',
    riskSevere: 'মারাত্মক',
    operationalRecommendation: 'এআই অপারেশনাল সুপারিশ',
    assistant: 'সহকারী',
    ragChatbot: 'র‌্যাগ চ্যাটবট',
    chatInitial: 'নমস্কার! আমি আবহাওয়া নির্দেশিকা, কর্মপরিকল্পনা এবং ঝুঁকি সংক্রান্ত পরামর্শে সাহায্য করতে পারি।',
    chatPlaceholderFarmer: 'কৃষক আবহাওয়া সহকারীকে জিজ্ঞাসা করুন...',
    chatPlaceholderGeneral: 'আবহাওয়া, ঝুঁকি বা পরিকল্পনা সম্পর্কে জিজ্ঞাসা করুন...',
    send: 'পাঠান',
    sending: 'পাঠানো হচ্ছে...',
    noticeModal: {
      tag: 'গুরুত্বপূর্ণ বিজ্ঞপ্তি',
      title: 'বিজ্ঞপ্তি: শুধুমাত্র কৃষকদের জন্য সক্রিয়',
      message:
        'এই ওয়েবসাইটটি বর্তমানে শুধুমাত্র কৃষকদের জন্য কার্যকরী। বাকি সকল পেশা বর্তমানে নির্মাণাধীন রয়েছে এবং ভবিষ্যতে আপডেট করা হবে।',
      farmerStatus: 'সক্রিয় ও কার্যকরী',
      otherStatus: 'নির্মাণাধীন',
      confirmBtn: 'বুঝেছি, এগিয়ে যান',
      closeButton: 'বিজ্ঞপ্তি বন্ধ করুন',
    },
    occupations: {
      farmer: {
        title: 'কৃষক',
        subtitle: 'ফসল ও ক্ষেতের আবহাওয়া বিশ্লেষণ',
      },
      marine: {
        title: 'মৎস্যজীবী / সামুদ্রিক',
        subtitle: 'সমুদ্রের নিরাপত্তা ও তরঙ্গের অবস্থা',
      },
      aviation: {
        title: 'বিমান চলাচল কর্মী',
        subtitle: 'উড়ান প্রস্তুতি ও দৃশ্যমানতা',
      },
      others: {
        title: 'অন্যান্য',
        subtitle: 'দৈনিক আবহাওয়া নির্দেশিকা',
      },
    },
  },
};

/** Translate weather condition description */
export function translateCondition(condition: string, lang: Language): string {
  if (lang === 'en') return condition;
  const c = condition.toLowerCase();

  if (lang === 'hi') {
    if (c.includes('thunder')) return 'आंधी और तूफान';
    if (c.includes('heavy rain')) return 'भारी बारिश';
    if (c.includes('rain shower')) return 'बारिश की बौछारें';
    if (c.includes('light rain') || c.includes('drizzle')) return 'हल्की बूंदाबांदी';
    if (c.includes('rain')) return 'बारिश';
    if (c.includes('snow')) return 'बर्फबारी';
    if (c.includes('overcast')) return 'घने बादल (Overcast)';
    if (c.includes('mostly cloudy')) return 'ज्यादातर बादल छाए रहेंगे';
    if (c.includes('partly cloudy')) return 'आंशिक रूप से बादल';
    if (c.includes('mainly clear')) return 'मुख्यतः साफ आसमान';
    if (c.includes('clear')) return 'साफ आसमान (Clear Sky)';
    if (c.includes('fog')) return 'कोहरा / धुंध';
    if (c.includes('haze') || c.includes('hazy')) return 'धुंधला मौसम (Haze)';
    if (c.includes('breezy')) return 'हवादार मौसम';
    return condition;
  }

  if (lang === 'bn') {
    if (c.includes('thunder')) return 'বজ্রঝড় ও বৃষ্টি';
    if (c.includes('heavy rain')) return 'ভারী বৃষ্টিপাত';
    if (c.includes('rain shower')) return 'বৃষ্টির ঝাপটা';
    if (c.includes('light rain') || c.includes('drizzle')) return 'হালকা গুঁড়ি গুঁড়ি বৃষ্টি';
    if (c.includes('rain')) return 'বৃষ্টিপাত';
    if (c.includes('snow')) return 'তুষারপাত';
    if (c.includes('overcast')) return 'মেঘলা আকাশ (Overcast)';
    if (c.includes('mostly cloudy')) return 'বেশিরভাগ সময় মেঘলা';
    if (c.includes('partly cloudy')) return 'আংশিক মেঘলা আকাশ';
    if (c.includes('mainly clear')) return 'প্রধানত পরিষ্কার আকাশ';
    if (c.includes('clear')) return 'পরিষ্কার আকাশ (Clear Sky)';
    if (c.includes('fog')) return 'কুয়াশাচ্ছন্ন';
    if (c.includes('haze') || c.includes('hazy')) return 'কুয়াশা ও ধোঁয়াশা';
    if (c.includes('breezy')) return 'দমকা বাতাস';
    return condition;
  }

  return condition;
}
