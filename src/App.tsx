import {
  createContext,
  FormEvent,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import {
  Language,
  LANGUAGES,
  translateCondition,
  translations,
} from './translations';

type OccupationKey = 'farmer' | 'marine' | 'aviation' | 'others';

type WeatherData = {
  locationName: string;
  country: string;
  temperatureC: number;
  feelsLikeC: number;
  humidity: number;
  pressure: number;
  windKmh: number;
  precipitationMm: number;
  precipitationProbability: number;
  condition: string;
  iconUrl: string;
  sunriseText: string;
  sunsetText: string;
};

type OccupationProfile = {
  key: OccupationKey;
  icon: string;
  accent: string;
  defaultCity: string;
};

type LocationSuggestion = {
  id: string;
  name: string;
  subtext: string;
};

type AIInsightItem = {
  tag: string;
  level: 'good' | 'warning' | 'danger' | 'info';
  icon: string;
  title: string;
  advice: string;
};

type AIInsightsResult = {
  headline: string;
  insights: AIInsightItem[];
  operationalNote: string;
  riskScore: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
};

// Language Context for full site translation
type LanguageContextType = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations.en;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: translations.en,
});

export const useLanguage = () => useContext(LanguageContext);

const occupationProfilesConfig: Record<OccupationKey, OccupationProfile> = {
  farmer: {
    key: 'farmer',
    icon: '🌾',
    accent: '#8bd66c',
    defaultCity: 'Nashik',
  },
  marine: {
    key: 'marine',
    icon: '🌊',
    accent: '#5ac6ff',
    defaultCity: 'Goa',
  },
  aviation: {
    key: 'aviation',
    icon: '✈️',
    accent: '#9d8cff',
    defaultCity: 'Delhi',
  },
  others: {
    key: 'others',
    icon: '☀️',
    accent: '#ffc863',
    defaultCity: 'Bengaluru',
  },
};

/** AI Insights Model: Generates dynamic, data-driven domain insights from live weather data in the selected language */
function generateAIInsights(
  weather: WeatherData | null,
  occupation: OccupationKey,
  lang: Language,
): AIInsightsResult {
  if (!weather) {
    if (lang === 'hi') {
      return {
        headline: 'मौसम डेटा की प्रतीक्षा है...',
        insights: [
          {
            tag: 'स्थिति',
            level: 'info',
            icon: '⏳',
            title: 'मौसम संबंधी डेटा एकत्र किया जा रहा है',
            advice: 'लाइव वायुमंडलीय डेटा प्राप्त होने पर एआई अंतर्दृष्टि स्वचालित रूप से उत्पन्न होगी।',
          },
        ],
        operationalNote: 'विशेषज्ञ एआई मौसम विश्लेषण प्राप्त करने के लिए स्थान चुनें।',
        riskScore: 0,
        riskLevel: 'Low',
      };
    }
    if (lang === 'bn') {
      return {
        headline: 'আবহাওয়ার তথ্যের জন্য অপেক্ষা করা হচ্ছে...',
        insights: [
          {
            tag: 'অবস্থা',
            level: 'info',
            icon: '⏳',
            title: 'আবহাওয়া তথ্য সংগ্রহ করা হচ্ছে',
            advice: 'লাইভ বায়ুমণ্ডলীয় তথ্য পাওয়া গেলে এআই অন্তর্দৃষ্টি স্বয়ংক্রিয়ভাবে তৈরি হবে।',
          },
        ],
        operationalNote: 'বিশেষজ্ঞ এআই আবহাওয়া বিশ্লেষণ দেখতে একটি অবস্থান নির্বাচন করুন।',
        riskScore: 0,
        riskLevel: 'Low',
      };
    }
    return {
      headline: 'Awaiting weather data...',
      insights: [
        {
          tag: 'Status',
          level: 'info',
          icon: '⏳',
          title: 'Collecting Meteorological Metrics',
          advice: 'AI insights will be generated automatically once live atmospheric data is fetched.',
        },
      ],
      operationalNote: 'Select a location to receive specialized AI weather analysis.',
      riskScore: 0,
      riskLevel: 'Low',
    };
  }

  const {
    temperatureC,
    feelsLikeC,
    humidity,
    pressure,
    windKmh,
    precipitationMm,
    precipitationProbability,
    condition,
  } = weather;

  const cLower = condition.toLowerCase();
  const isThunder = cLower.includes('thunder') || cLower.includes('storm');
  const isRain =
    precipitationMm > 0.5 ||
    precipitationProbability >= 50 ||
    cLower.includes('rain') ||
    cLower.includes('drizzle');
  const isFog = cLower.includes('fog') || cLower.includes('mist') || cLower.includes('haze');

  // Composite risk score calculation (1-10)
  let riskPoints = 1;
  if (isThunder) riskPoints += 4;
  else if (isRain) riskPoints += 2;
  if (windKmh > 35) riskPoints += 3;
  else if (windKmh > 22) riskPoints += 1;
  if (temperatureC > 38 || temperatureC < 5) riskPoints += 2;
  if (pressure < 1005) riskPoints += 2;
  const riskScore = Math.min(Math.max(riskPoints, 1), 10);
  const riskLevel: AIInsightsResult['riskLevel'] =
    riskScore >= 8 ? 'Severe' : riskScore >= 6 ? 'High' : riskScore >= 4 ? 'Moderate' : 'Low';

  const insights: AIInsightItem[] = [];

  // 1. Farmer Insights
  if (occupation === 'farmer') {
    // Spraying
    if (windKmh > 20) {
      insights.push({
        tag: lang === 'hi' ? 'छिड़काव जोखिम' : lang === 'bn' ? 'স্প্রে করার ঝুঁকি' : 'Spraying Hazard',
        level: 'warning',
        icon: '🌬️',
        title:
          lang === 'hi'
            ? 'कीटनाशक छिड़काव स्थगित करें'
            : lang === 'bn'
              ? 'কীটনাশক স্প্রে করা স্থগিত রাখুন'
              : 'Postpone Agrochemical Spraying',
        advice:
          lang === 'hi'
            ? `हवा की गति ${windKmh} किमी/घंटा है (सीमा 15 किमी/घंटा)। तेज हवा से कीटनाशक का बहाव असमान होगा और रसायन बर्बाद होगा।`
            : lang === 'bn'
              ? `বাতাসের গতিবেগ ${windKmh} কিমি/ঘণ্টা (অনুমোদিত সীমা ১৫ কিমি/ঘণ্টা)। বাতাসে ছিটকে গিয়ে ওষুধের অপচয় ও অসম বন্টন ঘটবে।`
              : `Wind speed is ${windKmh} km/h (threshold is 15 km/h). High wind drift will cause uneven pesticide dispersion and chemical wastage.`,
      });
    } else if (precipitationProbability > 40 || precipitationMm > 0.3) {
      insights.push({
        tag: lang === 'hi' ? 'धुलने का जोखिम' : lang === 'bn' ? 'ধুয়ে যাওয়ার ঝুঁকি' : 'Wash-off Risk',
        level: 'warning',
        icon: '🌧️',
        title:
          lang === 'hi'
            ? 'आज पर्ण छिड़काव से बचें'
            : lang === 'bn'
              ? 'আজ পাতায় স্প্রে করা এড়িয়ে চলুন'
              : 'Avoid Foliar Spraying Today',
        advice:
          lang === 'hi'
            ? `बारिश की संभावना (${precipitationProbability}%, ${precipitationMm} मिमी) छिड़काव किए गए रसायनों को अवशोषित होने से पहले धो देगी।`
            : lang === 'bn'
              ? `বৃষ্টিপাতের ঝুঁকি (${precipitationProbability}%, ${precipitationMm} মিমি) প্রয়োগ করা কীটনাশক শোষণের আগেই ধুয়ে ফেলতে পারে।`
              : `Precipitation threat (${precipitationProbability}% chance, ${precipitationMm} mm) risks washing away foliar nutrients and pesticides before leaf absorption.`,
      });
    } else {
      insights.push({
        tag: lang === 'hi' ? 'उत्तम छिड़काव समय' : lang === 'bn' ? 'স্প্রে করার আদর্শ সময়' : 'Optimal Spray Window',
        level: 'good',
        icon: '✅',
        title:
          lang === 'hi'
            ? 'छिड़काव के लिए अनुकूल स्थिति'
            : lang === 'bn'
              ? 'স্প্রে করার অনুকূল সময়'
              : 'Favorable Spraying Window',
        advice:
          lang === 'hi'
            ? `शांत हवा (${windKmh} किमी/घंटा) और शुष्क मौसम (${precipitationProbability}% बारिश) कीट व खरपतवार प्रबंधन के लिए उत्तम हैं।`
            : lang === 'bn'
              ? `শান্ত বাতাস (${windKmh} কিমি/ঘণ্টা) ও শুষ্ক আবহাওয়া (${precipitationProbability}% বৃষ্টির সম্ভাবনা) কীটনাশক প্রয়োগের আদর্শ সুযোগ দেয়।`
              : `Calm winds (${windKmh} km/h) and dry weather (${precipitationProbability}% rain chance) provide an ideal window for pest and weed management.`,
      });
    }

    // Irrigation
    if (precipitationMm >= 4 || precipitationProbability >= 65) {
      insights.push({
        tag: lang === 'hi' ? 'सिंचाई रोकें' : lang === 'bn' ? 'সেচ বন্ধ রাখুন' : 'Irrigation Suspended',
        level: 'info',
        icon: '💧',
        title:
          lang === 'hi'
            ? 'ड्रिप व फ्लड सिंचाई बंद रखें'
            : lang === 'bn'
              ? 'জমিতে সেচ দেওয়া বন্ধ রাখুন'
              : 'Halt Drip & Flood Irrigation',
        advice:
          lang === 'hi'
            ? `संभावित बारिश (${precipitationMm} मिमी, ${precipitationProbability}%) मिट्टी की नमी पूरी करेगी। जलभराव व जड़ सड़न से बचने के लिए सिंचाई रोकें।`
            : lang === 'bn'
              ? `প্রত্যাশিত বৃষ্টিপাত (${precipitationMm} মিমি, ${precipitationProbability}%) মাটির আর্দ্রতা পূরণ করবে। জলাবদ্ধতা এড়াতে সেচ স্থগিত রাখুন।`
              : `Anticipated rainfall (${precipitationMm} mm, ${precipitationProbability}% chance) will replenish soil profile. Stop irrigation to avoid waterlogging and root asphyxia.`,
      });
    } else if (temperatureC >= 32 && humidity < 45) {
      insights.push({
        tag: lang === 'hi' ? 'तेज वाष्पीकरण' : lang === 'bn' ? 'উচ্চ বাষ্পীভবন' : 'High Evapotranspiration',
        level: 'warning',
        icon: '☀️',
        title:
          lang === 'hi'
            ? 'सिंचाई की मात्रा बढ़ाएं'
            : lang === 'bn'
              ? 'সেচের পরিমাণ বৃদ্ধি করুন'
              : 'Increase Moisture Replenishment',
        advice:
          lang === 'hi'
            ? `गर्म तापमान (${temperatureC}°C) और शुष्क हवा (${humidity}%) मिट्टी को तेजी से सुखा रहे हैं। वाष्पीकरण कम करने के लिए सुबह सिंचाई करें।`
            : lang === 'bn'
              ? `উচ্চ তাপমাত্রা (${temperatureC}°C) এবং শুষ্ক বাতাস (${humidity}%) মাটির আর্দ্রতা হ্রাস করছে। অপচয় কমাতে ভোরে সেচ দিন।`
              : `Warm air (${temperatureC}°C) and dry humidity (${humidity}%) drive rapid soil transpiration. Irrigate early morning to reduce moisture loss.`,
      });
    } else {
      insights.push({
        tag: lang === 'hi' ? 'संतुलित नमी' : lang === 'bn' ? 'আর্দ্রতার ভারসাম্য' : 'Moisture Balance',
        level: 'good',
        icon: '🌱',
        title:
          lang === 'hi'
            ? 'सामान्य सिंचाई चक्र रखें'
            : lang === 'bn'
              ? 'স্বাভাবিক সেচ চক্র বজায় রাখুন'
              : 'Stable Soil Moisture Demand',
        advice:
          lang === 'hi'
            ? `वाष्पीकरण की दर सामान्य है। फसल के स्वास्थ्य के लिए नियमित सिंचाई चक्र का पालन करें।`
            : lang === 'bn'
              ? `বাষ্পীভবনের চাহিদা স্বাভাবিক। ফসলের বৃদ্ধির জন্য নিয়মিত সময়সূচি অনুযায়ী সেচ চালিয়ে যান।`
              : `Evaporative demand is moderate. Maintain standard scheduled irrigation cycles for vegetative crop health.`,
      });
    }

    // Thermal stress
    if (temperatureC >= 36) {
      insights.push({
        tag: lang === 'hi' ? 'फसल ताप तनाव' : lang === 'bn' ? 'ফসলের তাপীয় চাপ' : 'Thermal Crop Stress',
        level: 'danger',
        icon: '🔥',
        title:
          lang === 'hi'
            ? 'अत्यधिक गर्मी से सुरक्षा'
            : lang === 'bn'
              ? 'অতিরিক্ত তাপ থেকে সুরক্ষা'
              : 'Severe Heat Stress Precaution',
        advice:
          lang === 'hi'
            ? `तापमान ${temperatureC}°C (महसूस ${feelsLikeC}°C) परागण को नुकसान पहुंचा सकता है। फसलों के लिए शेड नेट और मल्चिंग लगाएं।`
            : lang === 'bn'
              ? `তাপমাত্রা ${temperatureC}°C (অনুভূত ${feelsLikeC}°C) পরাগায়ন ব্যাহত ও ফুল ঝরে পড়ার কারণ হতে পারে। শেড নেট ব্যবহার করুন।`
              : `Temperature at ${temperatureC}°C (feels like ${feelsLikeC}°C) can cause pollen desiccation and blossom drop. Deploy shade nets and mulching.`,
      });
    } else if (temperatureC <= 10) {
      insights.push({
        tag: lang === 'hi' ? 'ठंड / पाला अलर्ट' : lang === 'bn' ? 'ঠাণ্ডা / শৈত্যপ্রবাহ' : 'Cold / Frost Alert',
        level: 'warning',
        icon: '❄️',
        title:
          lang === 'hi'
            ? 'ठंड से फसल सुरक्षा'
            : lang === 'bn'
              ? 'ঠাণ্ডা আবহাওয়ায় সতর্কতা'
              : 'Cold Weather Protection',
        advice:
          lang === 'hi'
            ? `${temperatureC}°C का कम तापमान पौधों की वृद्धि धीमा करता है। संवेदनशील पौधों को रात की ठंड और पाले से बचाएं।`
            : lang === 'bn'
              ? `${temperatureC}°C এর নিম্ন তাপমাত্রা ফসলের বৃদ্ধি রোধ করে। চারাগাছ রাতে ঢেকে রাখুন।`
              : `Low temperature of ${temperatureC}°C suppresses vegetative vigor. Protect tender horticultural seedlings from night chilling.`,
      });
    } else {
      insights.push({
        tag: lang === 'hi' ? 'उत्तम तापमान' : lang === 'bn' ? 'আদর্শ তাপমাত্রা' : 'Thermal Optimum',
        level: 'good',
        icon: '🌾',
        title:
          lang === 'hi'
            ? 'फसल विकास के लिए आदर्श'
            : lang === 'bn'
              ? 'ফসলের বৃদ্ধির আদর্শ তাপমাত্রা'
              : 'Optimal Growth Temperature',
        advice:
          lang === 'hi'
            ? `वर्तमान तापमान (${temperatureC}°C) प्रकाश संश्लेषण और फसल उत्पादन के लिए सर्वथा उपयुक्त है।`
            : lang === 'bn'
              ? `বর্তমান তাপমাত্রা (${temperatureC}°C) সালোকসংশ্লেষণ ও ফসলের বৃদ্ধির জন্য সর্বাধিক উপযোগী।`
              : `Current temperature (${temperatureC}°C) is in the prime physiological range for active photosynthesis and crop biomass accumulation.`,
      });
    }

    // Fungal risk
    if (humidity >= 78 && temperatureC >= 20) {
      insights.push({
        tag: lang === 'hi' ? 'फफूंद संक्रमण का खतरा' : lang === 'bn' ? 'ছত্রাক সংক্রমণের ঝুঁকি' : 'Fungal Infection Risk',
        level: 'danger',
        icon: '🍄',
        title:
          lang === 'hi'
            ? 'झुलसा व फफूंद रोग की आशंका'
            : lang === 'bn'
              ? 'ব্লাইট ও ছত্রাকের উচ্চ ঝুঁকি'
              : 'High Blight & Mildew Threat',
        advice:
          lang === 'hi'
            ? `उच्च आर्द्रता (${humidity}%) और ${temperatureC}°C तापमान फंगस के बीजाणुओं को सक्रिय करता है। पत्तियों की बारीकी से जांच करें।`
            : lang === 'bn'
              ? `উচ্চ আর্দ্রতা (${humidity}%) এবং ${temperatureC}°C উষ্ণতা ছত্রাকের সংক্রমণ ত্বরান্বিত করে। পাতার রোগ পর্যবেক্ষণ করুন।`
              : `High ambient humidity (${humidity}%) combined with ${temperatureC}°C warmth accelerates fungal spore germination. Scout fields for downy mildew and rust.`,
      });
    } else {
      insights.push({
        tag: lang === 'hi' ? 'कम रोग दबाव' : lang === 'bn' ? 'রোগের কম ঝুঁকি' : 'Low Pathogen Risk',
        level: 'good',
        icon: '🛡️',
        title:
          lang === 'hi'
            ? 'पत्तियों पर रोग का खतरा कम'
            : lang === 'bn'
              ? 'ছত্রাকজনিত রোগের ঝুঁকি কম'
              : 'Foliar Disease Pressure Low',
        advice:
          lang === 'hi'
            ? `हवा की आर्द्रता (${humidity}%) सामान्य है। रोगजनकों के पनपने की संभावना काफी कम है।`
            : lang === 'bn'
              ? `আর্দ্রতার মাত্রা (${humidity}%) স্বাভাবিক থাকায় পাতায় ছত্রাকজনিত রোগের সম্ভাবনা খুব কম।`
              : `Atmospheric humidity at ${humidity}% keeps pathogen reproduction rates subdued. Leaf surfaces are drying adequately.`,
      });
    }

    let operationalNote = '';
    if (isRain || windKmh > 25) {
      operationalNote =
        lang === 'hi'
          ? `खेत से जल निकासी की व्यवस्था करें और रासायनिक छिड़काव टालें। वर्तमान मौसम और ${windKmh} किमी/घंटा हवा को देखते हुए इनडोर काम पर ध्यान दें।`
          : lang === 'bn'
            ? `মাঠের জল নিষ্কাশন পরীক্ষা করুন এবং স্প্রে স্থগিত রাখুন। বর্তমান আবহাওয়া ও ${windKmh} কিমি/ঘণ্টা বাতাসের কারণে ঘরোয়া কাজে মনোযোগ দিন।`
            : `Prioritize field drainage checks and suspend chemical spraying. The prevailing ${condition.toLowerCase()} and ${windKmh} km/h winds suggest shifting focus to indoor machinery maintenance and post-harvest grading.`;
    } else {
      operationalNote =
        lang === 'hi'
          ? `खेती के कार्यों के लिए बेहतरीन दिन। अनुकूल तापमान (${temperatureC}°C) और शांत हवा (${windKmh} किमी/घंटा) में बुवाई, निराई व कटाई करें।`
          : lang === 'bn'
            ? `কৃষিকাজের জন্য চমৎকার দিন। সহনশীল তাপমাত্রা (${temperatureC}°C) ও শান্ত বাতাসে (${windKmh} কিমি/ঘণ্টা) জমি তৈরি, সার প্রয়োগ বা ফসল তুলুন।`
            : `Outstanding conditions for agricultural fieldwork. Moderate temperatures (${temperatureC}°C) and steady ${windKmh} km/h winds offer ideal timing for land preparation, fertilization, and crop harvesting.`;
    }

    return {
      headline:
        lang === 'hi'
          ? 'कृषि निर्णय सहायता'
          : lang === 'bn'
            ? 'কৃষি সিদ্ধান্ত সহায়তা'
            : 'Agricultural Decision Support',
      insights,
      operationalNote,
      riskScore,
      riskLevel,
    };
  }

  // 2. Marine Insights
  if (occupation === 'marine') {
    if (windKmh >= 38) {
      insights.push({
        tag: lang === 'hi' ? 'तूफानी चेतावनी' : lang === 'bn' ? 'ঝড়ো সতর্কতা' : 'Gale Advisory',
        level: 'danger',
        icon: '🌊',
        title:
          lang === 'hi'
            ? 'समुद्र में ऊंची लहरों का खतरा'
            : lang === 'bn'
              ? 'বিপজ্জনক ঢেউ ও সমুদ্রের উত্তালতা'
              : 'Hazardous Wave & Swell State',
        advice:
          lang === 'hi'
            ? `हवा की गति ${windKmh} किमी/घंटा है, जिससे 2.5 मीटर से ऊंची लहरें उठ सकती हैं। छोटी नौकाएं बंदरगाह पर ही रहें।`
            : lang === 'bn'
              ? `${windKmh} কিমি/ঘণ্টার প্রবল বাতাস ২.৫ মিটারের বেশি ঢেউ তৈরি করছে। ছোট মাছ ধরার নৌকা বন্দরেই রাখুন।`
              : `Sustained winds of ${windKmh} km/h generate steep wave chop exceeding 2.5 meters. Small craft and non-mechanized fishing boats must stay in harbor.`,
      });
    } else if (windKmh >= 22) {
      insights.push({
        tag: lang === 'hi' ? 'मध्यम समुद्री लहरें' : lang === 'bn' ? 'মাঝারি উত্তাল সমুদ্র' : 'Moderate Sea Chop',
        level: 'warning',
        icon: '⚓',
        title:
          lang === 'hi'
            ? 'तटीय हवा का बहाव'
            : lang === 'bn'
              ? 'তীরবর্তী বাতাসের প্রভাব'
              : 'Brisk Inshore Wind Drift',
        advice:
          lang === 'hi'
            ? `${windKmh} किमी/घंटे की हवा से पानी में हलचल है। केवल जीपीएस युक्त बड़ी नौकाएं ही 5 समुद्री मील से आगे जाएं।`
            : lang === 'bn'
              ? `${windKmh} কিমি/ঘণ্টা বাতাসে মাঝারি ঢেউ রয়েছে। জিপিএস সহ ভারী বোট ছাড়া বেশি গভীরে যাওয়া ঝুঁকিপূর্ণ।`
              : `Wind at ${windKmh} km/h causes moderate whitecaps. Only well-equipped trawlers with active GPS and life vests should venture past 5 nautical miles.`,
      });
    } else {
      insights.push({
        tag: lang === 'hi' ? 'शांत समुद्र' : lang === 'bn' ? 'শান্ত সমুদ্র' : 'Calm Sea State',
        level: 'good',
        icon: '⛵',
        title:
          lang === 'hi'
            ? 'सुरक्षित नौकायन क्षेत्र'
            : lang === 'bn'
              ? 'নিরাপদ নৌচলাচল'
              : 'Safe Navigational Waters',
        advice:
          lang === 'hi'
            ? `हल्की हवा (${windKmh} किमी/घंटा) समुद्र की सतह को शांत रखती है। जाल फेंकने व मछली पकड़ने के लिए सुरक्षित है।`
            : lang === 'bn'
              ? `শান্ত বাতাস (${windKmh} কিমি/ঘণ্টা) সমুদ্র শান্ত রেখেছে। জাল ফেলা ও মাছ ধরার জন্য নিরাপদ পরিবেশ।`
              : `Gentle breeze (${windKmh} km/h) keeps sea surface smooth. Safe for open-water net laying, line fishing, and boat maneuvering.`,
      });
    }

    if (isThunder || precipitationProbability >= 60) {
      insights.push({
        tag: lang === 'hi' ? 'बिजली व आंधी का जोखिम' : lang === 'bn' ? 'বজ্রপাত ও ঝড়ের ঝুঁকি' : 'Squall Hazard',
        level: 'danger',
        icon: '⚡',
        title:
          lang === 'hi'
            ? 'समुद्री बिजली और तूफान अलर्ट'
            : lang === 'bn'
              ? 'সমুদ্রে বজ্রপাত ও ঝড়ের সতর্কতা'
              : 'Marine Lightning & Squall Alert',
        advice:
          lang === 'hi'
            ? `बिजली गिरने और अचानक तेज हवाओं की उच्च संभावना (${precipitationProbability}%)। समुद्र में दूर न जाएं और रेडियो चालू रखें।`
            : lang === 'bn'
              ? `হঠাৎ ঝড় ও বজ্রপাতের উচ্চ সম্ভাবনা (${precipitationProbability}%)। গভীর সমুদ্রে না গিয়ে উপকূলের কাছে থাকুন।`
              : `High probability of sudden offshore squalls and lightning (${precipitationProbability}%). Avoid isolated open sea positions; maintain radio contact on marine VHF.`,
      });
    } else {
      insights.push({
        tag: lang === 'hi' ? 'तूफान का खतरा कम' : lang === 'bn' ? 'ঝড়মুক্ত আবহাওয়া' : 'Low Squall Threat',
        level: 'good',
        icon: '🛡️',
        title:
          lang === 'hi'
            ? 'स्थिर समुद्री वातावरण'
            : lang === 'bn'
              ? 'স্থিতিশীল সামুদ্রিক পরিবেশ'
              : 'Stable Marine Atmosphere',
        advice:
          lang === 'hi'
            ? `तूफान की संभावना बहुत कम (${precipitationProbability}%) है। दिन के समय मछली पकड़ने के लिए उत्तम मौसम।`
            : lang === 'bn'
              ? `ঝড়ের সম্ভাবনা অত্যন্ত কম (${precipitationProbability}%)। দিনের বেলায় মাছ শিকারের জন্য উপযোগী।`
              : `Convective storm probability is minimal (${precipitationProbability}%). Atmospheric stability favors daytime coastal fishing voyages.`,
      });
    }

    if (pressure < 1005) {
      insights.push({
        tag: lang === 'hi' ? 'निम्न वायुदाब' : lang === 'bn' ? 'নিম্নচাপ সতর্কতা' : 'Barometric Depression',
        level: 'danger',
        icon: '📉',
        title:
          lang === 'hi'
            ? 'निम्न दबाव क्षेत्र बन रहा है'
            : lang === 'bn'
              ? 'নিম্নচাপ সৃষ্টি হচ্ছে'
              : 'Low Pressure System Incoming',
        advice:
          lang === 'hi'
            ? `वायुदाब घटकर ${pressure} hPa रह गया है, जो तटीय डिप्रेशन का संकेत है। अगले 12 घंटों में लहरें बढ़ सकती हैं।`
            : lang === 'bn'
              ? `বায়ুচাপ কমে ${pressure} hPa হয়েছে, যা সাগরে নিম্নচাপের পূর্বাভাস দেয়। পরবর্তী সময়ে উত্তাল ঢেউয়ের আশঙ্কা রয়েছে।`
              : `Atmospheric pressure down to ${pressure} hPa indicates an approaching coastal trough or depression. Expect worsening sea swells over the next 12 hours.`,
      });
    } else {
      insights.push({
        tag: lang === 'hi' ? 'स्थिर वायुदाब' : lang === 'bn' ? 'স্থিতিশীল বায়ুচাপ' : 'Atmospheric Pressure',
        level: 'good',
        icon: '🐟',
        title:
          lang === 'hi'
            ? 'मछलियों की सक्रियता अनुकूल'
            : lang === 'bn'
              ? 'মাছের সক্রিয়তার অনুকূল সময়'
              : 'Favorable Marine Pressure',
        advice:
          lang === 'hi'
            ? `संतुलित वायुदाब (${pressure} hPa) सतह पर मछलियों के विचरण व शिकार के लिए सकारात्मक संकेत है।`
            : lang === 'bn'
              ? `স্থিতিশীল বায়ুচাপ (${pressure} hPa) মাছের ঝাঁক ভেসে ওঠার পক্ষে অনুকূল।`
              : `Stable barometric pressure (${pressure} hPa) indicates positive fish feeding behavior in upper shelf waters.`,
      });
    }

    let operationalNote = '';
    if (windKmh > 30 || isThunder) {
      operationalNote =
        lang === 'hi'
          ? `बंदरगाह चेतावनी: तेज हवा (${windKmh} किमी/घंटा) और खराब मौसम के कारण समुद्र में न जाएं। नौकाओं को सुरक्षित बांधें।`
          : lang === 'bn'
            ? `বন্দর সতর্কতা: দমকা বাতাস (${windKmh} কিমি/ঘণ্টা) ও প্রতিকূল আবহাওয়ার কারণে সমুদ্রে যাওয়া এড়িয়ে চলুন। বোট নোঙর করে রাখুন।`
            : `Harbor warning in effect: Prevailing ${condition.toLowerCase()} and gusty ${windKmh} km/h winds produce hazardous swell heights. Secure moored craft and postpone deep-sea excursions.`;
    } else {
      operationalNote =
        lang === 'hi'
          ? `समुद्र में जाने के लिए उत्तम समय। शांत लहरें (${windKmh} किमी/घंटा, ${pressure} hPa) मछली पकड़ने के लिए पूर्णतः अनुकूल हैं।`
          : lang === 'bn'
            ? `সাগরে যাওয়ার জন্য চমৎকার অনুকূল পরিবেশ। শান্ত বাতাস (${windKmh} কিমি/ঘণ্টা, ${pressure} hPa) নিরাপদ মাছ ধরার সুযোগ দেয়।`
            : `Favorable maritime operating window: Calm sea state (${windKmh} km/h, ${pressure} hPa) offers ideal operating conditions for coastal trawling, aquaculture maintenance, and harbor transfers.`;
    }

    return {
      headline:
        lang === 'hi'
          ? 'समुद्री सुरक्षा और कैच इंटेलिजेंस'
          : lang === 'bn'
            ? 'সামুদ্রিক নিরাপত্তা ও মাছ শিকারের তথ্য'
            : 'Maritime Safety & Catch Intelligence',
      insights,
      operationalNote,
      riskScore,
      riskLevel,
    };
  }

  // 3. Aviation Insights
  if (occupation === 'aviation') {
    if (windKmh >= 35) {
      insights.push({
        tag: lang === 'hi' ? 'क्रॉसविंड अलर्ट' : lang === 'bn' ? 'ক্রসউইন্ড সতর্কতা' : 'Crosswind Advisory',
        level: 'danger',
        icon: '✈️',
        title:
          lang === 'hi'
            ? 'तेज सतही हवा की चेतावनी'
            : lang === 'bn'
              ? 'প্রবল ভূপৃষ্ঠ বাতাসের সতর্কতা'
              : 'Significant Surface Wind Component',
        advice:
          lang === 'hi'
            ? `रनवे पर हवा ${windKmh} किमी/घंटा (${(windKmh / 1.852).toFixed(0)} kts) है। लैंडिंग के समय विंड शीयर का ध्यान रखें।`
            : lang === 'bn'
              ? `রানওয়েতে বাতাসের গতিবেগ ${windKmh} কিমি/ঘণ্টা (${(windKmh / 1.852).toFixed(0)} kts)। অবতরণের সময় সাবধানতা অবলম্বন করুন।`
              : `Runway surface winds at ${windKmh} km/h (${(windKmh / 1.852).toFixed(0)} kts). Calculate crosswind limits carefully and anticipate low-level mechanical turbulence on approach.`,
      });
    } else {
      insights.push({
        tag: lang === 'hi' ? 'सामान्य रनवे हवा' : lang === 'bn' ? 'স্বাভাবিক রানওয়ে বাতাস' : 'Nominal Runway Winds',
        level: 'good',
        icon: '🛫',
        title:
          lang === 'hi'
            ? 'लैंडिंग और टेकऑफ के लिए अनुकूल'
            : lang === 'bn'
              ? 'অবতরণ ও উড্ডয়নের জন্য অনুকূল'
              : 'Favorable Approach Winds',
        advice:
          lang === 'hi'
            ? `हवा की गति (${windKmh} किमी/घंटा) सभी दिशाओं में विमान संचालन के लिए सुरक्षित सीमा में है।`
            : lang === 'bn'
              ? `বাতাসের গতিবেগ (${windKmh} কিমি/ঘণ্টা) বিমান উড্ডয়ন ও অবতরণের আদর্শ সীমার মধ্যে রয়েছে।`
              : `Surface winds (${windKmh} km/h / ${(windKmh / 1.852).toFixed(0)} kts) are well within standard visual and instrument runway parameters across all directions.`,
      });
    }

    if (isFog || (humidity >= 90 && isRain)) {
      insights.push({
        tag: lang === 'hi' ? 'आईएफआर अनिवार्य' : lang === 'bn' ? 'আইএফআর বাধ্যতামূলক' : 'IFR Minimums Enforced',
        level: 'danger',
        icon: '🎛️',
        title:
          lang === 'hi'
            ? 'कम दृश्यता व नीचे बादल'
            : lang === 'bn'
              ? 'কম দৃশ্যমানতা ও নিম্ন ক্লাউড সিলিং'
              : 'Low Cloud Ceiling & Restricted Visibility',
        advice:
          lang === 'hi'
            ? `कोहरा व बारिश से दृश्यता काफी घट गई है। केवल इंस्ट्रूमेंट फ्लाइट रूल्स (IFR) के तहत ही उड़ान संचालित करें।`
            : lang === 'bn'
              ? `কুয়াশা ও বৃষ্টির কারণে দৃশ্যমানতা অত্যন্ত কম। পাইলটদের আইএফআর প্রোটোকল মেনে চলার নির্দেশ।`
              : `Surface moisture and condensation reduce horizontal visibility below 3 statute miles. File IFR flight plans; prepare for CAT I/II precision instrument approaches.`,
      });
    } else {
      insights.push({
        tag: lang === 'hi' ? 'वीएफआर सामान्य' : lang === 'bn' ? 'ভিএফআর উপযুক্ত' : 'VFR Optimal',
        level: 'good',
        icon: '🌤️',
        title:
          lang === 'hi'
            ? 'स्पष्ट दृश्य उड़ान स्थिति'
            : lang === 'bn'
              ? 'উত্তম দৃষ্টিগোচর পরিস্থিতি'
              : 'Unrestricted Visual Flight Rules',
        advice:
          lang === 'hi'
            ? `स्पष्ट दृश्यता (>10 किमी) और ऊंचे बादल। दृश्य उड़ान (VFR) और प्रशिक्षण उड़ानों के लिए उत्कृष्ट स्थिति।`
            : lang === 'bn'
              ? `১০ কিমির বেশি পরিষ্কার দৃশ্যমানতা। সাধারণ উড্ডয়ন ও পাইলট প্রশিক্ষণের জন্য চমৎকার আবহাওয়া।`
              : `High cloud bases and visibility exceeding 10 km. Clear conditions for private pilot operations, cross-country navigation, and aerodrome circuit practice.`,
      });
    }

    let operationalNote = '';
    if (isThunder || windKmh > 35 || isFog) {
      operationalNote =
        lang === 'hi'
          ? `विमानन अलर्ट: मौसम में ${windKmh} किमी/घंटा हवा और कम दृश्यता के कारण उड़ानों में देरी संभव है। वैकल्पिक हवाई अड्डों की योजना रखें।`
          : lang === 'bn'
            ? `বিমান চলাচল সতর্কতা: ${windKmh} কিমি/ঘণ্টা বাতাস এবং প্রতিকূল আবহাওয়ার জন্য ফ্লাইট শিডিউলে বিলম্ব হতে পারে। বিকল্প বিমানবন্দর প্রস্তুত রাখুন।`
            : `Aviation alert: Prevailing ${condition.toLowerCase()} with ${windKmh} km/h winds and low ceilings require strict IFR adherence. Brief passengers for potential enroute delays or alternate airport diversions.`;
    } else {
      operationalNote =
        lang === 'hi'
          ? `उड़ान के लिए बेहतरीन स्थिति। स्थिर दबाव (${pressure} hPa) और सामान्य हवा (${windKmh} किमी/घंटा) के साथ सभी उड़ानें समय पर संभव हैं।`
          : lang === 'bn'
            ? `উড়ানের জন্য আদর্শ পরিবেশ। স্থিতিশীল বায়ুচাপ (${pressure} hPa) ও শান্ত বাতাসের কারণে সকল ফ্লাইট নিরাপদে পরিচালনাযোগ্য।`
            : `VFR flight conditions confirmed. Stable atmospheric pressure (${pressure} hPa) and manageable surface wind (${windKmh} km/h) allow routine flight departures and flight school training operations.`;
    }

    return {
      headline:
        lang === 'hi'
          ? 'वैमानिकी मौसम ब्रीफिंग'
          : lang === 'bn'
            ? 'বিমান চলাচল আবহাওয়া ব্রিফিং'
            : 'Aeronautical Weather Briefing',
      insights,
      operationalNote,
      riskScore,
      riskLevel,
    };
  }

  // 4. "others" (General Public)
  if (precipitationProbability >= 45 || precipitationMm > 0.5) {
    insights.push({
      tag: lang === 'hi' ? 'वर्षा अलर्ट' : lang === 'bn' ? 'বৃষ্টির সতর্কতা' : 'Precipitation Plan',
      level: 'warning',
      icon: '☔',
      title:
        lang === 'hi'
          ? 'छाता साथ रखें'
          : lang === 'bn'
            ? 'বাইরে বের হলে ছাতা সঙ্গে রাখুন'
            : 'Carry Rain Protection',
      advice:
        lang === 'hi'
          ? `बारिश की अधिक संभावना (${precipitationProbability}%, ${precipitationMm} मिमी)। सड़कों पर फिसलन व यातायात धीमा रह सकता है।`
          : lang === 'bn'
            ? `বৃষ্টিপাতের প্রবল সম্ভাবনা (${precipitationProbability}%, ${precipitationMm} মিমি)। রাস্তায় যানজট ও জল জমার সম্ভাবনা রয়েছে।`
            : `Rain likelihood is high (${precipitationProbability}% chance, ${precipitationMm} mm). Expect wet sidewalks, increased road traffic, and commute slowdowns.`,
    });
  } else {
    insights.push({
      tag: lang === 'hi' ? 'सुखद आवागमन' : lang === 'bn' ? 'স্বস্তিদায়ক যাতায়াত' : 'Commute Comfort',
      level: 'good',
      icon: '🚶',
      title:
        lang === 'hi'
          ? 'सूखी सड़कें व साफ मौसम'
          : lang === 'bn'
            ? 'পরিষ্কার ও শুষ্ক রাস্তা'
            : 'Dry Road Conditions',
      advice:
        lang === 'hi'
          ? `बारिश की कोई संभावना नहीं (${precipitationProbability}%)। सुबह की सैर, ऑफिस आवागमन और बाहरी कार्यों के लिए उत्तम।`
          : lang === 'bn'
            ? `বৃষ্টির সম্ভাবনা নেই (${precipitationProbability}%)। প্রাতঃভ্রমণ, অফিস যাতায়াত ও বাইরের কাজের জন্য আদর্শ।`
            : `Dry weather expected (${precipitationProbability}% rain chance). Optimal timing for morning walks, cycling to work, and outdoor errands.`,
    });
  }

  if (feelsLikeC >= 35) {
    insights.push({
      tag: lang === 'hi' ? 'गर्मी से बचाव' : lang === 'bn' ? 'অতিরিক্ত গরম' : 'Heat Index Caution',
      level: 'danger',
      icon: '🔥',
      title:
        lang === 'hi'
          ? 'लू और अधिक ताप से बचें'
          : lang === 'bn'
            ? 'প্রখর রোদ ও গরম থেকে সাবধান'
            : 'Intense Thermal Load',
      advice:
        lang === 'hi'
          ? `तापमान ${feelsLikeC}°C जैसा महसूस हो रहा है। खूब पानी पिएं, सूती कपड़े पहनें और दोपहर में धूप से बचें।`
          : lang === 'bn'
            ? `অনুভূত তাপমাত্রা ${feelsLikeC}°C। প্রচুর জল পান করুন, সুতির পোশাক পরুন এবং চড়া রোদ এড়িয়ে চলুন।`
            : `Feels like ${feelsLikeC}°C. Stay hydrated, wear light cotton apparel, and avoid intense direct sun between 12 PM and 3 PM.`,
    });
  } else if (feelsLikeC <= 14) {
    insights.push({
      tag: lang === 'hi' ? 'ठंडी हवा' : lang === 'bn' ? 'শীতল আবহাওয়া' : 'Chilly Air',
      level: 'info',
      icon: '🧥',
      title:
        lang === 'hi'
          ? 'गर्म कपड़े पहनें'
          : lang === 'bn'
            ? 'হালকা গরম পোশাক পরুন'
            : 'Warm Layering Recommended',
      advice:
        lang === 'hi'
          ? `मौसम ठंडा है (महसूस ${feelsLikeC}°C)। सुबह और शाम को बाहर निकलते समय जैकेट या स्वेटर पहनें।`
          : lang === 'bn'
            ? `ঠাণ্ডা হাওয়া অনুভূত হচ্ছে (${feelsLikeC}°C)। সকাল ও সন্ধ্যায় বাইরে বের হলে হালকা জ্যাকেট সাথে রাখুন।`
            : `Apparent temperature feels like ${feelsLikeC}°C. Bring a jacket or sweater, particularly for early morning transit or evening outings.`,
    });
  } else {
    insights.push({
      tag: lang === 'hi' ? 'अनुकूल तापमान' : lang === 'bn' ? 'মনোরম তাপমাত্রা' : 'Thermal Comfort',
      level: 'good',
      icon: '👌',
      title:
        lang === 'hi'
          ? 'सुहावना मौसम'
          : lang === 'bn'
            ? 'আরামদায়ক আবহাওয়া'
            : 'Pleasant Ambient Temperature',
      advice:
        lang === 'hi'
          ? `मौसम बहुत सुखद है (${temperatureC}°C, महसूस ${feelsLikeC}°C)। आउटडोर एक्टिविटी व घूमने के लिए बेहतरीन।`
          : lang === 'bn'
            ? `খুবই মনোরম আবহাওয়া (${temperatureC}°C, অনুভূত ${feelsLikeC}°C)। পার্কে হাঁটাচলা ও ভ্রমণের জন্য উপযুক্ত।`
            : `Comfortable thermal sensation (${temperatureC}°C, feels like ${feelsLikeC}°C). Great conditions for dining outside and leisure walks.`,
    });
  }

  let operationalNote = '';
  if (isRain) {
    operationalNote =
      lang === 'hi'
        ? `आज छाता या रेनकोट साथ रखना आवश्यक है। संभावित बारिश (${precipitationProbability}%) से यातायात में देरी हो सकती है।`
        : lang === 'bn'
          ? `আজ বাইরে বের হলে ছাতা বা রেইনকোট সাথে রাখুন। বৃষ্টির কারণে (${precipitationProbability}%) রাস্তায় যানজট হতে পারে।`
          : `Rain gear is essential today: Anticipate ${condition.toLowerCase()} and wet transit conditions (${precipitationProbability}% rain chance). Plan extra travel time for cross-town commutes.`;
  } else {
    operationalNote =
      lang === 'hi'
        ? `दैनिक गतिविधियों के लिए उत्तम दिन। अनुकूल तापमान (${temperatureC}°C) और सुहावनी हवा के साथ दिन का आनंद लें।`
        : lang === 'bn'
          ? `দৈনন্দিন কাজের জন্য চমৎকার দিন। অনুকূল তাপমাত্রা (${temperatureC}°C) এবং মৃদুমন্দ বাতাসের সাথে কাজের পরিকল্পনা করুন।`
          : `Favorable day for personal and outdoor activities: Comfortable temperature (${temperatureC}°C) and gentle winds (${windKmh} km/h) ensure smooth travel and daytime leisure.`;
  }

  return {
    headline:
      lang === 'hi'
        ? 'दैनिक निर्णय बुद्धिमत्ता'
        : lang === 'bn'
          ? 'দৈনন্দিন জীবনযাপন পরামর্শ'
          : 'Daily Decision Intelligence',
    insights,
    operationalNote,
    riskScore,
    riskLevel,
  };
}

/** Language Selector Dropdown Component */
function LanguageSelector() {
  const { lang, setLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="language-selector" ref={containerRef}>
      <button
        type="button"
        className={`language-btn ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select website language"
      >
        <span className="lang-flag">{currentLang.flag}</span>
        <span>{currentLang.nativeName}</span>
        <span className="lang-arrow">▼</span>
      </button>

      {isOpen && (
        <ul className="language-dropdown">
          {LANGUAGES.map((item) => (
            <li key={item.code}>
              <button
                type="button"
                className={`language-option ${item.code === lang ? 'active' : ''}`}
                onClick={() => {
                  setLang(item.code);
                  setIsOpen(false);
                }}
              >
                <span>
                  {item.flag} {item.nativeName} ({item.label})
                </span>
                {item.code === lang && <span className="lang-check">✓</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const POPULAR_LOCATIONS: LocationSuggestion[] = [
  // India - Metros & Major Cities
  { id: 'in-del', name: 'Delhi', subtext: 'Delhi, India' },
  { id: 'in-ndl', name: 'New Delhi', subtext: 'Delhi, India' },
  { id: 'in-mum', name: 'Mumbai', subtext: 'Maharashtra, India' },
  { id: 'in-blr', name: 'Bengaluru', subtext: 'Karnataka, India' },
  { id: 'in-kol', name: 'Kolkata', subtext: 'West Bengal, India' },
  { id: 'in-chn', name: 'Chennai', subtext: 'Tamil Nadu, India' },
  { id: 'in-hyd', name: 'Hyderabad', subtext: 'Telangana, India' },
  { id: 'in-pun', name: 'Pune', subtext: 'Maharashtra, India' },
  { id: 'in-ahd', name: 'Ahmedabad', subtext: 'Gujarat, India' },
  { id: 'in-sur', name: 'Surat', subtext: 'Gujarat, India' },
  { id: 'in-jai', name: 'Jaipur', subtext: 'Rajasthan, India' },
  { id: 'in-lko', name: 'Lucknow', subtext: 'Uttar Pradesh, India' },
  { id: 'in-kan', name: 'Kanpur', subtext: 'Uttar Pradesh, India' },
  { id: 'in-nag', name: 'Nagpur', subtext: 'Maharashtra, India' },
  { id: 'in-ind', name: 'Indore', subtext: 'Madhya Pradesh, India' },
  { id: 'in-bho', name: 'Bhopal', subtext: 'Madhya Pradesh, India' },
  { id: 'in-pat', name: 'Patna', subtext: 'Bihar, India' },
  { id: 'in-vad', name: 'Vadodara', subtext: 'Gujarat, India' },
  { id: 'in-chd', name: 'Chandigarh', subtext: 'Punjab & Haryana, India' },
  { id: 'in-cbe', name: 'Coimbatore', subtext: 'Tamil Nadu, India' },
  { id: 'in-koc', name: 'Kochi', subtext: 'Kerala, India' },
  { id: 'in-tvm', name: 'Thiruvananthapuram', subtext: 'Kerala, India' },
  { id: 'in-vzg', name: 'Visakhapatnam', subtext: 'Andhra Pradesh, India' },
  { id: 'in-bbs', name: 'Bhubaneswar', subtext: 'Odisha, India' },
  { id: 'in-gau', name: 'Guwahati', subtext: 'Assam, India' },
  { id: 'in-rnc', name: 'Ranchi', subtext: 'Jharkhand, India' },
  { id: 'in-var', name: 'Varanasi', subtext: 'Uttar Pradesh, India' },
  { id: 'in-agr', name: 'Agra', subtext: 'Uttar Pradesh, India' },
  { id: 'in-amr', name: 'Amritsar', subtext: 'Punjab, India' },
  { id: 'in-srg', name: 'Srinagar', subtext: 'Jammu and Kashmir, India' },
  { id: 'in-shl', name: 'Shimla', subtext: 'Himachal Pradesh, India' },
  { id: 'in-ddn', name: 'Dehradun', subtext: 'Uttarakhand, India' },
  { id: 'in-leh', name: 'Leh', subtext: 'Ladakh, India' },
  { id: 'in-goa', name: 'Goa', subtext: 'Goa, India' },
  { id: 'in-pan', name: 'Panaji', subtext: 'Goa, India' },
  { id: 'in-nas', name: 'Nashik', subtext: 'Maharashtra, India' },
  { id: 'in-sol', name: 'Solapur', subtext: 'Maharashtra, India' },
  { id: 'in-jlg', name: 'Jalgaon', subtext: 'Maharashtra, India' },
  { id: 'in-gnt', name: 'Guntur', subtext: 'Andhra Pradesh, India' },
  { id: 'in-mng', name: 'Mangalore', subtext: 'Karnataka, India' },
  { id: 'in-mys', name: 'Mysuru', subtext: 'Karnataka, India' },
  { id: 'in-mdu', name: 'Madurai', subtext: 'Tamil Nadu, India' },
  { id: 'in-jdh', name: 'Jodhpur', subtext: 'Rajasthan, India' },
  { id: 'in-uda', name: 'Udaipur', subtext: 'Rajasthan, India' },
  { id: 'in-rpr', name: 'Raipur', subtext: 'Chhattisgarh, India' },
  { id: 'in-pbl', name: 'Port Blair', subtext: 'Andaman & Nicobar, India' },
  { id: 'in-gur', name: 'Gurugram', subtext: 'Haryana, India' },
  { id: 'in-noi', name: 'Noida', subtext: 'Uttar Pradesh, India' },
  { id: 'in-fbd', name: 'Faridabad', subtext: 'Haryana, India' },
  { id: 'in-ldh', name: 'Ludhiana', subtext: 'Punjab, India' },

  // Global Metros
  { id: 'us-nyc', name: 'New York', subtext: 'New York, United States' },
  { id: 'us-lax', name: 'Los Angeles', subtext: 'California, United States' },
  { id: 'us-sfo', name: 'San Francisco', subtext: 'California, United States' },
  { id: 'us-chi', name: 'Chicago', subtext: 'Illinois, United States' },
  { id: 'us-mia', name: 'Miami', subtext: 'Florida, United States' },
  { id: 'us-sea', name: 'Seattle', subtext: 'Washington, United States' },
  { id: 'uk-lon', name: 'London', subtext: 'England, United Kingdom' },
  { id: 'uk-man', name: 'Manchester', subtext: 'England, United Kingdom' },
  { id: 'fr-par', name: 'Paris', subtext: 'Île-de-France, France' },
  { id: 'de-ber', name: 'Berlin', subtext: 'Germany' },
  { id: 'de-muc', name: 'Munich', subtext: 'Bavaria, Germany' },
  { id: 'it-rom', name: 'Rome', subtext: 'Lazio, Italy' },
  { id: 'es-mad', name: 'Madrid', subtext: 'Spain' },
  { id: 'es-bcn', name: 'Barcelona', subtext: 'Catalonia, Spain' },
  { id: 'nl-ams', name: 'Amsterdam', subtext: 'North Holland, Netherlands' },
  { id: 'ch-zur', name: 'Zurich', subtext: 'Switzerland' },
  { id: 'ae-dxb', name: 'Dubai', subtext: 'United Arab Emirates' },
  { id: 'ae-auh', name: 'Abu Dhabi', subtext: 'United Arab Emirates' },
  { id: 'sg-sin', name: 'Singapore', subtext: 'Singapore' },
  { id: 'jp-tyo', name: 'Tokyo', subtext: 'Japan' },
  { id: 'jp-osa', name: 'Osaka', subtext: 'Japan' },
  { id: 'kr-sel', name: 'Seoul', subtext: 'South Korea' },
  { id: 'th-bkk', name: 'Bangkok', subtext: 'Thailand' },
  { id: 'my-kul', name: 'Kuala Lumpur', subtext: 'Malaysia' },
  { id: 'id-jkt', name: 'Jakarta', subtext: 'Indonesia' },
  { id: 'au-syd', name: 'Sydney', subtext: 'New South Wales, Australia' },
  { id: 'au-mel', name: 'Melbourne', subtext: 'Victoria, Australia' },
  { id: 'ca-tor', name: 'Toronto', subtext: 'Ontario, Canada' },
  { id: 'ca-van', name: 'Vancouver', subtext: 'British Columbia, Canada' },
  { id: 'eg-cai', name: 'Cairo', subtext: 'Egypt' },
  { id: 'za-cpt', name: 'Cape Town', subtext: 'South Africa' },
  { id: 'br-sao', name: 'São Paulo', subtext: 'Brazil' },
];

const activepiecesWebhookUrl = (import.meta.env.VITE_ACTIVEPIECES_WEBHOOK_URL as string | undefined) ?? '';

/** Safely parse fetch response */
async function safeJsonParse(response: Response): Promise<Record<string, unknown>> {
  const text = await response.text();
  if (!text) {
    throw new Error(`API returned empty response (HTTP ${response.status}).`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`API returned non-JSON response (HTTP ${response.status}).`);
  }
}

/** Fallback weather SVG generator so weather graphics NEVER break */
function FallbackWeatherSvg({ condition }: { condition: string }) {
  const c = condition.toLowerCase();

  // Thunderstorm
  if (c.includes('thunder') || c.includes('storm')) {
    return (
      <svg width="68" height="68" viewBox="0 0 64 64" fill="none">
        <path d="M20 36h24a10 10 0 0 0 1-19.9 14 14 0 0 0-27-2.1A9 9 0 0 0 20 36z" fill="#37474f" />
        <polygon points="32,38 24,48 30,48 26,58 38,46 32,46" fill="#ffd54f" stroke="#ffb300" strokeWidth="1" />
      </svg>
    );
  }

  // Rain / Drizzle / Showers
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) {
    return (
      <svg width="68" height="68" viewBox="0 0 64 64" fill="none">
        <path d="M22 36h24a10 10 0 0 0 1-19.9 14 14 0 0 0-27-2.1A9 9 0 0 0 22 36z" fill="url(#rainCloudGrad)" />
        <g stroke="#64b5f6" strokeWidth="2.5" strokeLinecap="round">
          <line x1="22" y1="42" x2="18" y2="52" />
          <line x1="32" y1="42" x2="28" y2="52" />
          <line x1="42" y1="42" x2="38" y2="52" />
        </g>
        <defs>
          <linearGradient id="rainCloudGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#90caf9" />
            <stop offset="100%" stopColor="#455a64" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Snow
  if (c.includes('snow') || c.includes('flurr') || c.includes('ice') || c.includes('hail')) {
    return (
      <svg width="68" height="68" viewBox="0 0 64 64" fill="none">
        <path d="M22 36h24a10 10 0 0 0 1-19.9 14 14 0 0 0-27-2.1A9 9 0 0 0 22 36z" fill="#b0bec5" />
        <circle cx="24" cy="46" r="2.5" fill="#e0f7fa" />
        <circle cx="34" cy="48" r="2.5" fill="#e0f7fa" />
        <circle cx="44" cy="46" r="2.5" fill="#e0f7fa" />
      </svg>
    );
  }

  // Overcast / Cloudy (full)
  if (c.includes('overcast') || (c.includes('cloud') && !c.includes('partly') && !c.includes('mainly') && !c.includes('mostly'))) {
    return (
      <svg width="68" height="68" viewBox="0 0 64 64" fill="none">
        <path d="M18 42h28a11 11 0 0 0 1-21.9 15 15 0 0 0-29-2.1A10 10 0 0 0 18 42z" fill="url(#grayCloudGrad)" />
        <defs>
          <linearGradient id="grayCloudGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#cfd8dc" />
            <stop offset="100%" stopColor="#78909c" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Partly Cloudy / Mostly Sunny / Scattered Clouds
  if (c.includes('partly') || c.includes('mostly') || c.includes('mainly') || c.includes('scattered') || c.includes('fair')) {
    return (
      <svg width="68" height="68" viewBox="0 0 64 64" fill="none">
        <circle cx="26" cy="24" r="12" fill="url(#sunGradP)" />
        <path d="M22 44h24a10 10 0 0 0 1-19.9 14 14 0 0 0-27-2.1A9 9 0 0 0 22 44z" fill="url(#whiteCloudGrad)" />
        <defs>
          <radialGradient id="sunGradP" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fff59d" />
            <stop offset="100%" stopColor="#ff9800" />
          </radialGradient>
          <linearGradient id="whiteCloudGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#90a4ae" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Fog / Mist / Haze
  if (c.includes('fog') || c.includes('mist') || c.includes('haze') || c.includes('smoke')) {
    return (
      <svg width="68" height="68" viewBox="0 0 64 64" fill="none">
        <g stroke="#b0bec5" strokeWidth="3" strokeLinecap="round">
          <line x1="16" y1="24" x2="48" y2="24" />
          <line x1="12" y1="32" x2="52" y2="32" />
          <line x1="18" y1="40" x2="46" y2="40" />
          <line x1="14" y1="48" x2="50" y2="48" />
        </g>
      </svg>
    );
  }

  // Clear Sky / Sunny
  return (
    <svg width="68" height="68" viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="14" fill="url(#sunGradFull)" />
      <g stroke="#ffb300" strokeWidth="3" strokeLinecap="round">
        <line x1="32" y1="8" x2="32" y2="3" />
        <line x1="32" y1="61" x2="32" y2="56" />
        <line x1="8" y1="32" x2="3" y2="32" />
        <line x1="61" y1="32" x2="56" y2="32" />
        <line x1="15" y1="15" x2="11" y2="11" />
        <line x1="49" y1="49" x2="53" y2="53" />
        <line x1="15" y1="49" x2="11" y2="53" />
        <line x1="49" y1="15" x2="53" y2="11" />
      </g>
      <defs>
        <radialGradient id="sunGradFull" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fffde7" />
          <stop offset="40%" stopColor="#ffd54f" />
          <stop offset="100%" stopColor="#ff8f00" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/** WeatherIcon with automatic fallback to SVG if the image URL fails to load */
function WeatherIcon({ iconUrl, condition }: { iconUrl: string; condition: string }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [iconUrl]);

  if (!hasError && iconUrl) {
    return (
      <img
        src={iconUrl}
        alt={condition}
        onError={() => setHasError(true)}
        style={{ width: '74px', height: '74px', objectFit: 'contain' }}
      />
    );
  }

  return <FallbackWeatherSvg condition={condition} />;
}

/** Parse Google Weather API response */
function parseGoogleWeather(
  data: Record<string, unknown>,
  locationName: string,
  country: string,
): WeatherData {
  const temp = data.temperature as { degrees?: number } | undefined;
  const feelsLike = data.feelsLikeTemperature as { degrees?: number } | undefined;
  const wind = data.wind as { speed?: { value?: number } } | undefined;
  const airPressure = data.airPressure as { meanSeaLevelMillibars?: number } | undefined;
  const weatherCondition = data.weatherCondition as {
    description?: { text?: string };
    iconBaseUri?: string;
    type?: string;
  } | undefined;
  const precipObj = data.precipitation as {
    probability?: { percent?: number; type?: string };
    qpf?: { quantity?: number; unit?: string };
    snowQpf?: { quantity?: number; unit?: string };
  } | undefined;

  const temperatureC = Number(temp?.degrees ?? 0);
  const precipitationMm = Number(precipObj?.qpf?.quantity ?? 0);
  const precipitationProbability = Number(precipObj?.probability?.percent ?? (precipitationMm > 0 ? 80 : 0));

  let conditionText = weatherCondition?.description?.text;
  if (!conditionText || conditionText.toLowerCase() === 'weather update') {
    const typeStr = weatherCondition?.type || '';
    const typeMap: Record<string, string> = {
      CLEAR: 'Clear Sky',
      MOSTLY_CLEAR: 'Mainly Clear',
      PARTLY_CLOUDY: 'Partly Cloudy',
      MOSTLY_CLOUDY: 'Mostly Cloudy',
      CLOUDY: 'Overcast',
      RAIN: 'Rain',
      LIGHT_RAIN: 'Light Rain',
      HEAVY_RAIN: 'Heavy Rain',
      THUNDERSTORM: 'Thunderstorm',
      FOG: 'Fog',
      WINDY: 'Breezy / Windy',
      HAZE: 'Hazy',
      SMOKE: 'Hazy / Smoky',
      DRIZZLE: 'Drizzle',
      SNOW: 'Snow',
    };
    conditionText = typeMap[typeStr] || (precipitationMm > 0 ? 'Rain' : 'Partly Cloudy');
  }

  const iconUrl = weatherCondition?.iconBaseUri
    ? `${weatherCondition.iconBaseUri}.png`
    : 'https://maps.gstatic.com/weather/v1/sunny.png';

  return {
    locationName,
    country,
    temperatureC,
    feelsLikeC: Number(feelsLike?.degrees ?? temperatureC),
    humidity: Number(data.relativeHumidity ?? 0),
    windKmh: Number(wind?.speed?.value ?? 0),
    pressure: Number(airPressure?.meanSeaLevelMillibars ?? 1013),
    precipitationMm,
    precipitationProbability,
    condition: conditionText,
    iconUrl,
    sunriseText: '--',
    sunsetText: '--',
  };
}

/** Fallback weather fetcher via Open-Meteo with accurate precipitation and varied conditions */
async function fetchFallbackWeather(lat: number, lng: number, locationName: string, country: string): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,precipitation_probability,rain,showers,weather_code,cloud_cover,surface_pressure,wind_speed_10m&daily=sunrise,sunset&timezone=auto`;
  const res = await fetch(url);
  const data = await res.json();
  const current = data?.current || {};
  const daily = data?.daily || {};

  const weatherCodeMap: Record<number, string> = {
    0: 'Clear Sky',
    1: 'Mainly Clear',
    2: 'Partly Cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing Rime Fog',
    51: 'Light Drizzle',
    53: 'Moderate Drizzle',
    55: 'Dense Drizzle',
    56: 'Freezing Drizzle',
    61: 'Slight Rain',
    63: 'Moderate Rain',
    65: 'Heavy Rain',
    71: 'Slight Snow',
    73: 'Moderate Snow',
    75: 'Heavy Snow',
    80: 'Slight Rain Showers',
    81: 'Moderate Rain Showers',
    82: 'Violent Rain Showers',
    85: 'Snow Showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with Hail',
    99: 'Severe Thunderstorm',
  };

  const code = Number(current.weather_code ?? current.weathercode ?? -1);
  const cloudCover = Number(current.cloud_cover ?? 0);
  const precip = Number(current.precipitation ?? current.rain ?? current.showers ?? 0);
  const precipProb = Number(current.precipitation_probability ?? (precip > 0 ? 80 : 0));
  const humidity = Number(current.relative_humidity_2m ?? 50);
  const windKmh = Number(current.wind_speed_10m ?? 10);

  let condition = '';
  if (code > 0 && weatherCodeMap[code]) {
    condition = weatherCodeMap[code];
  } else if (precip >= 5) {
    condition = 'Heavy Rain';
  } else if (precip > 1) {
    condition = 'Rain Showers';
  } else if (precip > 0.1) {
    condition = 'Light Drizzle';
  } else if (cloudCover >= 80) {
    condition = 'Overcast';
  } else if (cloudCover >= 50) {
    condition = 'Mostly Cloudy';
  } else if (cloudCover >= 20) {
    condition = 'Partly Cloudy';
  } else if (cloudCover >= 8) {
    condition = 'Mainly Clear';
  } else if (humidity >= 85) {
    condition = 'Hazy / Humid';
  } else if (windKmh >= 30) {
    condition = 'Breezy & Fair';
  } else if (code === 0) {
    condition = 'Clear Sky';
  } else {
    condition = cloudCover >= 30 ? 'Partly Cloudy' : 'Clear Sky';
  }

  const cLower = condition.toLowerCase();
  let iconUrl = 'https://maps.gstatic.com/weather/v1/sunny.png';
  if (cLower.includes('thunder')) {
    iconUrl = 'https://maps.gstatic.com/weather/v1/thunderstorm.png';
  } else if (cLower.includes('heavy rain')) {
    iconUrl = 'https://maps.gstatic.com/weather/v1/heavy_rain.png';
  } else if (cLower.includes('rain') || cLower.includes('drizzle') || cLower.includes('shower')) {
    iconUrl = 'https://maps.gstatic.com/weather/v1/rain.png';
  } else if (cLower.includes('snow')) {
    iconUrl = 'https://maps.gstatic.com/weather/v1/snow.png';
  } else if (cLower.includes('overcast') || (cLower.includes('cloud') && !cLower.includes('partly') && !cLower.includes('mainly'))) {
    iconUrl = 'https://maps.gstatic.com/weather/v1/cloudy.png';
  } else if (cLower.includes('partly') || cLower.includes('mainly') || cLower.includes('mostly')) {
    iconUrl = 'https://maps.gstatic.com/weather/v1/partly_cloudy.png';
  } else if (cLower.includes('fog') || cLower.includes('haze')) {
    iconUrl = 'https://maps.gstatic.com/weather/v1/fog.png';
  }

  const sunrise = Array.isArray(daily.sunrise) && daily.sunrise[0] ? daily.sunrise[0].split('T')[1] ?? '--' : '--';
  const sunset = Array.isArray(daily.sunset) && daily.sunset[0] ? daily.sunset[0].split('T')[1] ?? '--' : '--';

  return {
    locationName,
    country,
    temperatureC: Number(current.temperature_2m ?? 24),
    feelsLikeC: Number(current.apparent_temperature ?? current.temperature_2m ?? 24),
    humidity,
    windKmh,
    pressure: Math.round(Number(current.surface_pressure ?? 1013)),
    precipitationMm: precip,
    precipitationProbability: precipProb,
    condition,
    iconUrl,
    sunriseText: sunrise,
    sunsetText: sunset,
  };
}

function App() {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('weathergpt_lang') as Language;
    if (saved && (saved === 'en' || saved === 'hi' || saved === 'bn')) {
      return saved;
    }
    return 'en';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('weathergpt_lang', newLang);
  };

  const t = translations[lang] || translations.en;

  const contextValue = useMemo(
    () => ({
      lang,
      setLang,
      t,
    }),
    [lang, t],
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      <Routes>
        <Route path="/" element={<OccupationSelector />} />
        <Route path="/:occupation" element={<OccupationPage />} />
      </Routes>
    </LanguageContext.Provider>
  );
}

function OccupationSelector() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const cards = useMemo(
  () =>
    (Object.entries(occupationProfilesConfig) as Array<[OccupationKey, OccupationProfile]>).map(
      ([key, value]) => ({
        ...value,
        title: t.occupations[key]?.title || key,
        subtitle: t.occupations[key]?.subtitle || '',
      }),
    ),
  [t],
);

  return (
    <div className="app-shell">
      <div className="selection-container">
        <div className="glow glow-one" />
        <div className="glow glow-two" />

        <header className="topbar">
          <div className="brand">
            <span className="brand-mark">W</span>
            <span>{t.brand}</span>
          </div>
          <div className="topbar-right">
            <div className="tag">{t.tagline}</div>
            <LanguageSelector />
          </div>
        </header>

        <main className="hero">
          <div className="hero-copy">
            <p className="eyebrow">{t.eyebrow}</p>
            <h1>{t.heroTitle}</h1>
            <p className="subcopy">{t.heroSubtitle}</p>
          </div>

          <div className="occupation-grid">
            {cards.map((item) => (
              <button
                key={item.key}
                type="button"
                className="occupation-card"
                onClick={() => navigate(`/${item.key}`)}
                style={{ ['--accent' as string]: item.accent }}
              >
                <div className="card-icon">{item.icon}</div>
                <div className="card-copy">
                  <h3>{item.title}</h3>
                  <p>{item.subtitle}</p>
                </div>
                <div className="arrow">→</div>
              </button>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

function OccupationPage() {
  const { occupation } = useParams<{ occupation?: string }>();
  const safeOccupation = (occupation as OccupationKey | undefined) ?? 'others';
  const profileConfig = occupationProfilesConfig[safeOccupation] ?? occupationProfilesConfig.others;
  const { lang, t } = useLanguage();

  const profile = {
    ...profileConfig,
    title: t.occupations[safeOccupation]?.title || safeOccupation,
    subtitle: t.occupations[safeOccupation]?.subtitle || '',
  };

  // Search input space starts completely blank
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Suggestions state
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Dynamic AI insights derived from live weather data in the selected language
  const aiInsights = useMemo(() => {
    return generateAIInsights(weather, safeOccupation, lang);
  }, [weather, safeOccupation, lang]);

  // Translated condition
  const localizedCondition = useMemo(() => {
    if (!weather) return '';
    return translateCondition(weather.condition, lang);
  }, [weather, lang]);

  // Translated risk level
  const localizedRiskLevel = useMemo(() => {
    if (aiInsights.riskLevel === 'Low') return t.riskLow;
    if (aiInsights.riskLevel === 'Moderate') return t.riskModerate;
    if (aiInsights.riskLevel === 'High') return t.riskHigh;
    return t.riskSevere;
  }, [aiInsights.riskLevel, t]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update suggestions dynamically as the user types
  useEffect(() => {
    const query = city.trim();
    if (!query) {
      setSuggestions([]);
      setShowSuggestions(false);
      setHighlightedIndex(-1);
      return;
    }

    const qLower = query.toLowerCase();

    // Instant client-side search across popular cities
    const prefixMatches: LocationSuggestion[] = [];
    const substringMatches: LocationSuggestion[] = [];

    for (const item of POPULAR_LOCATIONS) {
      const nameLower = item.name.toLowerCase();
      const subLower = item.subtext.toLowerCase();

      if (nameLower.startsWith(qLower)) {
        prefixMatches.push(item);
      } else if (nameLower.includes(qLower) || subLower.includes(qLower)) {
        substringMatches.push(item);
      }
    }

    const matched = [...prefixMatches, ...substringMatches].slice(0, 8);
    setSuggestions(matched);
    setShowSuggestions(matched.length > 0);
    setHighlightedIndex(-1);

    // Also query backend suggestions API if user typed 2+ chars
    let isCancelled = false;
    if (query.length >= 2) {
      fetch(`/api/suggestions?q=${encodeURIComponent(query)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!isCancelled && data?.suggestions && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
            const apiSuggestions: LocationSuggestion[] = data.suggestions.map(
              (s: { id?: string; name?: string; subtext?: string; full?: string }) => ({
                id: s.id || s.name || Math.random().toString(),
                name: s.name || s.full || query,
                subtext: s.subtext || '',
              }),
            );
            const combinedMap = new Map<string, LocationSuggestion>();
            for (const item of [...matched, ...apiSuggestions]) {
              const key = item.name.toLowerCase();
              if (!combinedMap.has(key)) {
                combinedMap.set(key, item);
              }
            }
            const combined = Array.from(combinedMap.values()).slice(0, 8);
            setSuggestions(combined);
            setShowSuggestions(combined.length > 0);
          }
        })
        .catch(() => {
          // Keep local list
        });
    }

    return () => {
      isCancelled = true;
    };
  }, [city]);

  /** Reverse geocode coordinates to get the specific place/city name */
  const reverseGeocode = async (lat: number, lng: number): Promise<{ locationName: string; country: string }> => {
    try {
      const res = await fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        const data = await res.json();
        if (data.locationName && data.locationName !== 'Detected Location') {
          return {
            locationName: data.locationName,
            country: data.country || 'Current Area',
          };
        }
      }
    } catch {
      // Continue to fallback
    }

    // Free OpenStreetMap reverse geocode fallback
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`);
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || addr.state_district || 'Local Region';
        const state = addr.state || '';
        const country = addr.country || 'Current Area';
        const locationName = state ? `${city}, ${state}` : city;
        return { locationName, country };
      }
    } catch {
      // Continue
    }

    return { locationName: 'Detected Area', country: 'Nearby' };
  };

  /** Fetch weather for specific coordinates */
  const fetchWeatherForCoordinates = async (lat: number, lng: number, specificLocationName: string, country: string) => {
    setLoading(true);
    setError('');

    try {
      // 1. Try Google Weather API via backend proxy
      try {
        const response = await fetch(`/api/weather?lat=${lat}&lng=${lng}`);
        const data = await safeJsonParse(response);

        if (response.ok && !data?.error) {
          setWeather(parseGoogleWeather(data, specificLocationName, country));
          return;
        }
      } catch {
        // Fall back to Open-Meteo
      }

      // 2. Fallback to Open-Meteo with accurate precipitation and varied conditions
      const fallbackData = await fetchFallbackWeather(lat, lng, specificLocationName, country);
      setWeather(fallbackData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong while fetching weather data.');
    } finally {
      setLoading(false);
    }
  };

  /** Geocode a city name, then fetch weather for the resolved coordinates */
  const fetchWeather = async (location: string) => {
    const targetLocation = location.trim() || profile.defaultCity;

    setLoading(true);
    setError('');

    try {
      let lat: number | null = null;
      let lng: number | null = null;
      let locationText = targetLocation;
      let country = 'Unknown';

      // 1. Try server geocode
      try {
        const geocodeResponse = await fetch(`/api/geocode?address=${encodeURIComponent(targetLocation)}`);
        const geocodeData = await safeJsonParse(geocodeResponse);

        if (geocodeResponse.ok && geocodeData.status === 'OK' && (geocodeData.results as unknown[])?.length) {
          const results = geocodeData.results as Array<{
            geometry: { location: { lat: number; lng: number } };
            formatted_address?: string;
            address_components?: Array<{ types?: string[]; long_name?: string }>;
          }>;
          const place = results[0];
          lat = place.geometry.location.lat;
          lng = place.geometry.location.lng;
          locationText = place.formatted_address || targetLocation;
          country =
            place.address_components?.find((c) => c.types?.includes('country'))?.long_name ?? 'Unknown';
        }
      } catch {
        // Fallback geocoding below
      }

      // 2. Fallback geocoding via Open-Meteo Geocoding API
      if (lat === null || lng === null) {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(targetLocation)}&count=1&language=en&format=json`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();
        if (geoData?.results && geoData.results.length > 0) {
          const item = geoData.results[0];
          lat = Number(item.latitude);
          lng = Number(item.longitude);
          const state = item.admin1 ? `, ${item.admin1}` : '';
          locationText = `${item.name}${state}`;
          country = item.country || 'Unknown';
        } else {
          throw new Error(`Could not find coordinates for "${targetLocation}". Please check spelling.`);
        }
      }

      await fetchWeatherForCoordinates(lat, lng, locationText, country);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong while fetching weather data.');
    } finally {
      setLoading(false);
    }
  };

  /** Detect user location via GPS and reverse-geocode to actual place name */
  const getCurrentLocationWeather = async () => {
    if (!navigator.geolocation) {
      await fetchWeather(profile.defaultCity);
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000,
        });
      });

      const { latitude, longitude } = position.coords;
      const { locationName, country } = await reverseGeocode(latitude, longitude);

      await fetchWeatherForCoordinates(latitude, longitude, locationName, country);
    } catch {
      await fetchWeather(profile.defaultCity);
    }
  };

  useEffect(() => {
    setCity('');
    void getCurrentLocationWeather();
  }, [safeOccupation]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowSuggestions(false);
    if (city.trim()) {
      void fetchWeather(city.trim());
    } else {
      void fetchWeather(profile.defaultCity);
    }
  };

  const handleSelectSuggestion = (item: LocationSuggestion) => {
    setCity(item.name);
    setShowSuggestions(false);
    void fetchWeather(item.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-bg" />

      <header className="dashboard-header">
        <div className="header-left">
          <Link to="/" className="ghost-button">
            {t.back}
          </Link>

          <div className="header-profile">
            <span className="profile-icon">{profile.icon}</span>
            <div>
              <p className="label">{t.profile}</p>
              <h2>{profile.title}</h2>
            </div>
          </div>
        </div>

        <div className="header-right">
          <LanguageSelector />
        </div>
      </header>

      <main className="dashboard-grid">
        <section className="weather-panel glass-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow light">{t.liveWeather}</p>
              <h3>
                {profile.title} {t.dashboard}
              </h3>
            </div>
            <div className="status-dot">{t.live}</div>
          </div>

          <form className="search-bar" onSubmit={handleSubmit}>
            <div className="search-input-wrapper" ref={searchContainerRef}>
              <input
                type="text"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                onKeyDown={handleKeyDown}
                placeholder={t.searchPlaceholder(profile.defaultCity)}
                autoComplete="off"
              />

              {showSuggestions && suggestions.length > 0 && (
                <ul className="suggestions-dropdown">
                  {suggestions.map((item, index) => (
                    <li
                      key={item.id}
                      className={`suggestion-item ${index === highlightedIndex ? 'active' : ''}`}
                      onClick={() => handleSelectSuggestion(item)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      <span className="suggestion-icon">📍</span>
                      <span className="suggestion-name">{item.name}</span>
                      {item.subtext && <span className="suggestion-sub">{item.subtext}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button type="submit" className="primary-button">
              {t.update}
            </button>
          </form>

          {error && <div className="error-banner">{error}</div>}

          {loading && !weather ? (
            <div className="empty-state">{t.fetchingWeather}</div>
          ) : weather ? (
            <>
              <div className="weather-top">
                <div>
                  <p className="location">
                    {weather.locationName}, {weather.country}
                  </p>
                  <h1>{Math.round(weather.temperatureC)}°C</h1>
                  <div className="condition-row">
                    <span className="condition">{localizedCondition}</span>
                    <span className="precip-pill">
                      🌧️ {weather.precipitationProbability}% {t.precipAbbr} ({weather.precipitationMm} mm)
                    </span>
                  </div>
                </div>

                <div className="weather-icon">
                  <WeatherIcon iconUrl={weather.iconUrl} condition={weather.condition} />
                </div>
              </div>

              <div className="stats-grid">
                <MetricCard label={t.feelsLike} value={`${Math.round(weather.feelsLikeC)}°C`} />
                <MetricCard
                  label={t.precipitation}
                  value={`${weather.precipitationMm} mm (${weather.precipitationProbability}%)`}
                />
                <MetricCard label={t.humidity} value={`${Math.round(weather.humidity)}%`} />
                <MetricCard label={t.wind} value={`${Math.round(weather.windKmh)} km/h`} />
                <MetricCard label={t.pressure} value={`${Math.round(weather.pressure)} hPa`} />
                <MetricCard label={t.sunrise} value={weather.sunriseText} />
                <MetricCard label={t.sunset} value={weather.sunsetText} />
              </div>
            </>
          ) : (
            <div className="empty-state">{t.weatherWillAppear}</div>
          )}
        </section>

        <aside className="insights-panel glass-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow light">{t.aiInsightsModel}</p>
              <h3>{profile.subtitle}</h3>
            </div>
            <div className={`insight-header-badge risk-${aiInsights.riskLevel.toLowerCase()}`}>
              {t.risk}: {localizedRiskLevel} ({aiInsights.riskScore}/10)
            </div>
          </div>

          <div className="suggestion-list">
            {aiInsights.insights.map((item, index) => (
              <div key={`${item.title}-${index}`} className="ai-insight-card">
                <div className="ai-insight-top">
                  <span className={`ai-insight-tag tag-${item.level}`}>
                    {item.icon} {item.tag}
                  </span>
                </div>
                <h4 className="ai-insight-title">{item.title}</h4>
                <p className="ai-insight-advice">{item.advice}</p>
              </div>
            ))}
          </div>

          <div className="summary-box">
            <p className="summary-label">{t.operationalRecommendation}</p>
            <p>{aiInsights.operationalNote}</p>
          </div>
        </aside>

        <section className="chat-panel glass-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow light">{t.assistant}</p>
              <h3>{t.ragChatbot}</h3>
            </div>
          </div>
          <Chatbot occupation={safeOccupation} />
        </section>
      </main>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Chatbot({ occupation }: { occupation: OccupationKey }) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState(() => [
    {
      sender: 'bot',
      text: t.chatInitial,
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Update initial message if language changes and only initial message is present
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].sender === 'bot') {
        return [{ sender: 'bot', text: t.chatInitial }];
      }
      return prev;
    });
  }, [t.chatInitial]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const userMessage = { sender: 'user', text: trimmed };
    setMessages((previous) => [...previous, userMessage]);
    setInput('');
    setIsSending(true);

    try {
      if (occupation === 'farmer' && activepiecesWebhookUrl) {
        const response = await fetch(activepiecesWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: trimmed,
            query: trimmed,
            occupation: 'farmer',
            role: 'Farmer',
            source: 'WeatherGPT_Forge',
            timestamp: new Date().toISOString(),
          }),
        });

        let botText = `Weather GPT: I connected to your Activepieces farmer bot for "${trimmed}".`;

        if (response.ok) {
          const contentType = response.headers.get('content-type') ?? '';
          if (contentType.includes('application/json')) {
            const data = await response.json();
            const candidate =
              data?.answer ??
              data?.reply ??
              data?.message ??
              data?.output ??
              data?.response ??
              data?.result ??
              data?.text;
            if (typeof candidate === 'string' && candidate.trim()) {
              botText = candidate.trim();
            } else if (data && typeof data === 'object') {
              botText = JSON.stringify(data, null, 2);
            }
          } else {
            const text = await response.text();
            if (text.trim()) {
              botText = text.trim();
            }
          }
        } else {
          botText = `Weather GPT: Your Activepieces flow returned an error (${response.status}). Check the published webhook and ensure the flow is active.`;
        }

        setMessages((previous) => [...previous, { sender: 'bot', text: botText }]);
        return;
      }

      const fallbackReply = `Weather GPT: Based on the current conditions, here is a suggested answer for "${trimmed}". Connect your RAG backend here for dynamic AI responses.`;
      setMessages((previous) => [...previous, { sender: 'bot', text: fallbackReply }]);
    } catch (error) {
      const fallbackReply =
        error instanceof Error
          ? `Weather GPT: Error while contacting Activepieces: ${error.message}`
          : 'Weather GPT: There was an issue contacting the chatbot service.';
      setMessages((previous) => [...previous, { sender: 'bot', text: fallbackReply }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="chatbox">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={`${message.sender}-${index}`} className={`message ${message.sender}`}>
            {message.text}
          </div>
        ))}
      </div>

      <div className="chat-input-row">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              void sendMessage();
            }
          }}
          placeholder={occupation === 'farmer' ? t.chatPlaceholderFarmer : t.chatPlaceholderGeneral}
          disabled={isSending}
        />
        <button type="button" onClick={() => void sendMessage()} disabled={isSending}>
          {isSending ? t.sending : t.send}
        </button>
      </div>
    </div>
  );
}

export default App;
