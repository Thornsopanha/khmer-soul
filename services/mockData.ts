import { Category, ContentItem } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: '1',
    slug: 'temples-architecture',
    title_en: 'Temples & Architecture',
    title_km: 'ប្រាសាទ និង ស្ថាបត្យកម្ម',
    description_en: 'The divine engineering of the Khmer Empire.',
    description_km: 'វិស្វកម្មដ៏អស្ចារ្យនៃចក្រភពខ្មែរ',
    // Wide Angkor Wat view in strong dark orange sunset tones
    cover_image: 'https://toursbyjeeps.com/wp-content/uploads/2021/07/Untitled-6.jpg', 
    order: 1,
  },
  {
    id: '2',
    slug: 'dance-performance',
    title_en: 'Dance & Performance',
    title_km: 'របាំ និង ការសម្តែង',
    description_en: 'Graceful movements telling ancient legends.',
    description_km: 'កាយវិការដ៏ទន់ភ្លន់ដែលរៀបរាប់ពីរឿងព្រេងបុរាណ',
    // Apsara dancers in warm stage lighting
    cover_image: 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/11/8c/9f/2c.jpg', 
    order: 2,
  },
  {
    id: '3',
    slug: 'traditional-instruments',
    title_en: 'Traditional Instruments',
    title_km: 'ឧបករណ៍តន្ត្រីបុរាណ',
    description_en: 'The sounds of the ancestors.',
    description_km: 'សម្លេងនៃបុព្វបុរស',
    // Chapei Dang Veng player with warm background
    cover_image: 'https://files.intocambodia.org/wp-content/uploads/2024/08/10093327/Chapei-Dang-Veng-7-960x611.jpg', 
    order: 3,
  },
  {
    id: '4',
    slug: 'clothing-textiles',
    title_en: 'Clothing & Textiles',
    title_km: 'សម្លៀកបំពាក់ និង វាយនភណ្ឌ',
    description_en: 'Silk, krama, and royal attire.',
    description_km: 'សូត្រ ក្រមា និងសម្លៀកបំពាក់រាជវង្ស',
    // Traditional Cambodian costumes in rich orange/gold
    cover_image: 'https://www.asiakingtravel.com/cuploads/files/Traditional-Cambodian-costumes-2.jpg', 
    order: 4,
  },
  {
    id: '5',
    slug: 'food-cuisine',
    title_en: 'Food & Cuisine',
    title_km: 'ម្ហូបអាហារ',
    description_en: 'A balance of salty, sweet, sour, and bitter.',
    description_km: 'ការលាយបញ្ចូលគ្នានៃរសជាតិប្រៃ ផ្អែម ជូរ និងល្វីង',
    // Fish amok dish styled with warm dark orange presentation
    cover_image: 'https://image.cookly.me/images/Siem-Reap-Food-Amok.cover.jpg', 
    order: 5,
  },
  {
    id: '6',
    slug: 'festivals-rituals',
    title_en: 'Festivals & Rituals',
    title_km: 'ពិធីបុណ្យ និង ទំនៀមទម្លាប់',
    description_en: 'Celebrating life, harvest, and spirits.',
    description_km: 'ការអបអរសាទរជីវិត ការប្រមូលផល និងវិញ្ញាណក្ខន្ធ',
    // Monk procession/festival scene in deep orange sunset lighting
    cover_image: 'https://cambodiatravel.com/images/2025/07/Meak-Bochea-Festival-in-Cambodia3.jpg', 
    order: 6,
  },
];

export const CONTENT_ITEMS: ContentItem[] = [
  // Temples
  {
    id: 't1',
    category_slug: 'temples-architecture',
    title_en: 'Angkor Wat',
    title_km: 'អង្គរវត្ត',
    summary_en: 'The largest religious monument in the world.',
    summary_km: 'វិមានសាសនាដ៏ធំបំផុតនៅលើពិភពលោក',
    content_en: 'Angkor Wat is a temple complex in Cambodia and is the largest religious monument in the world, on a site measuring 162.6 hectares. Originally constructed as a Hindu temple dedicated to the god Vishnu for the Khmer Empire, it was gradually transformed into a Buddhist temple towards the end of the 12th century.',
    content_km: 'អង្គរវត្តគឺជាប្រាសាទមួយនៅក្នុងប្រទេសកម្ពុជា និងជាវិមានសាសនាដ៏ធំបំផុតនៅលើពិភពលោក ដែលមានទីតាំងនៅលើផ្ទៃដី ១៦២.៦ ហិកតា។ ដើមឡើយត្រូវបានសាងសង់ជាប្រាសាទហិណ្ឌូឧទ្ទិសដល់ព្រះវិស្ណុសម្រាប់ចក្រភពខ្មែរ បន្ទាប់មកត្រូវបានប្រែក្លាយជាប្រាសាទពុទ្ធសាសនានៅចុងសតវត្សទី១២។',
    images: [
      // Iconic front view in intense dark orange sunset
      'https://toursbyjeeps.com/wp-content/uploads/2021/07/Untitled-6.jpg',
      // Wide panoramic Angkor Wat sunset
      'https://www.cambodia-images.com/wp-content/uploads/2018/05/Angkor-sunset_1.jpg'
    ],
    created_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 't2',
    category_slug: 'temples-architecture',
    title_en: 'Bayon Temple',
    title_km: 'ប្រាសាទបាយ័ន',
    summary_en: 'Known for its smiling stone faces.',
    summary_km: 'ល្បីល្បាញដោយសារមុខថ្មញញឹម',
    content_en: 'The Bayon is a richly decorated Khmer temple at Angkor in Cambodia. Built in the late 12th or early 13th century as the state temple of the Mahayana Buddhist King Jayavarman VII, the Bayon stands at the centre of Jayavarman\'s capital, Angkor Thom.',
    content_km: 'ប្រាសាទបាយ័នគឺជាប្រាសាទខ្មែរដែលមានក្បូរក្បាច់រចនាយ៉ាងល្អប្រណិតនៅតំបន់អង្គរក្នុងប្រទេសកម្ពុជា។ សាងសង់នៅចុងសតវត្សទី១២ ឬដើមសតវត្សទី១៣ ជាប្រាសាទរដ្ឋរបស់ព្រះបាទជ័យវរ្ម័នទី៧ ដែលជាស្តេចកាន់ព្រះពុទ្ធសាសនាមហាយាន ប្រាសាទបាយ័នស្ថិតនៅចំកណ្តាលរាជធានីអង្គរធំរបស់ព្រះបាទជ័យវរ្ម័ន។',
    // Famous faces in warm orange sunset glow
    images: ['https://www.visitkohrong.com/wp-content/uploads/2023/09/Bayon-Temple-in-Cambodia-121212.jpg'],
    created_at: '2023-01-02T00:00:00Z',
  },
  // Dance
  {
    id: 'd1',
    category_slug: 'dance-performance',
    title_en: 'Apsara Dance',
    title_km: 'របាំអប្សរា',
    summary_en: 'A classical dance form dating back to the Angkorian era.',
    summary_km: 'ទម្រង់របាំបុរាណដែលមានតាំងពីសម័យអង្គរ',
    content_en: 'The Apsara Dance is a traditional dance of the Kingdom of Cambodia. It dates back to the 7th century Sambor Prei Kuk. The dance is famous for its elegant and graceful movements, distinct hand gestures, and elaborate costumes.',
    content_km: 'របាំអប្សរាជារបាំប្រពៃណីរបស់ព្រះរាជាណាចក្រកម្ពុជា។ វាមានតាំងពីសតវត្សទី៧ នៅសំបូរព្រៃគុក។ របាំនេះល្បីល្បាញដោយសារកាយវិការដ៏ស្រស់ស្អាតនិងទន់ភ្លន់ កាយវិការដៃជាក់លាក់ និងសម្លៀកបំពាក់ដ៏ប្រណិត។',
    // Group performance with dramatic warm orange stage lights
    images: ['https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/11/8c/9f/2c.jpg'],
    created_at: '2023-01-03T00:00:00Z',
  },
  // Instruments
  {
    id: 'i1',
    category_slug: 'traditional-instruments',
    title_en: 'Chapei Dang Veng',
    title_km: 'ចាប៉ីដងវែង',
    summary_en: 'A Cambodian two-stringed, long-necked guitar.',
    summary_km: 'ឧបករណ៍តន្ត្រីខ្មែរមានខ្សែពីរ និងដងវែង',
    content_en: 'The Chapei Dang Veng is a Cambodian two-stringed, long-necked guitar. It is used in traditional music and is often played during weddings and shadow puppet theater performances. The instrument is a vital part of Cambodian cultural heritage.',
    content_km: 'ចាប៉ីដងវែងគឺជាឧបករណ៍តន្ត្រីខ្មែរដែលមានខ្សែពីរ និងដងវែង។ វាត្រូវបានប្រើប្រាស់ក្នុងតន្ត្រីប្រពៃណី និងត្រូវបានលេងជាញឹកញាប់ក្នុងពិធីមង្គលការ និងការសម្តែងល្ខោនស្បែក។ ឧបករណ៍នេះគឺជាផ្នែកដ៏សំខាន់នៃបេតិកភណ្ឌវប្បធម៌កម្ពុជា។',
    // Close-up of player and instrument in warm tones
    images: ['https://files.intocambodia.org/wp-content/uploads/2024/08/10093327/Chapei-Dang-Veng-7-960x611.jpg'],
    created_at: '2023-01-04T00:00:00Z',
  },
  // Clothing
  {
    id: 'c1',
    category_slug: 'clothing-textiles',
    title_en: 'Krama',
    title_km: 'ក្រមា',
    summary_en: 'The sturdy traditional garment of Cambodia.',
    summary_km: 'សម្លៀកបំពាក់ប្រពៃណីដ៏រឹងមាំរបស់កម្ពុជា',
    content_en: 'The Krama is a sturdy traditional Cambodian garment with many uses, including as a scarf, bandanna, to cover the face, for decorative purposes, and as a hammock for children. It is worn by men, women and children.',
    content_km: 'ក្រមាគឺជាសម្លៀកបំពាក់ប្រពៃណីខ្មែរដ៏រឹងមាំដែលមានការប្រើប្រាស់ច្រើនយ៉ាង រួមទាំងជាកន្សែង ក្រណាត់រុំក្បាល ដើម្បីបិទមុខ សម្រាប់គោលបំណងតុបតែង និងជាអង្រឹងសម្រាប់កុមារ។ វាត្រូវបានពាក់ដោយបុរស ស្ត្រី និងកុមារ។',
    // Traditional checkered krama in orange-dominant pattern
    images: ['https://i.etsystatic.com/20254876/r/il/c3ea74/6365603405/il_fullxfull.6365603405_ipvw.jpg'],
    created_at: '2023-01-05T00:00:00Z',
  }
];
