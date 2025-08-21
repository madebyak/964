'use client';

import NewsTickerText from '@/components/NewsTickerText';
import AnimatedTextSlider from '@/components/AnimatedTextSlider';

export default function NewsTickerPage() {
  const newsItems = [
    'الانتخابات القادمة تشبه 2005 ـ الحكيم من اليوسفية: استحقاق مصيري يؤسس للاستقرار المستدام',
    'مشهد مؤلم.. مصرع عامل بإحدى شركات الكهرباء إثر تعرضه لصدمة كهربائية في الناصرية',
    'السليمانية تلتهب.. حملة اعتقالات تطال قيادات بارزة في الاتحاد الوطني الكردستاني',
    'محكمة استئناف في نيويورك تلغي غرامة على ترامب بنحو نصف مليار دولار',
    'خلال لقائه عدداً من ذوي الضحايا.. السيد الحكيم يدعو إلى تلافي تكرار حادثة الكوت',
  ];

  const animatedTexts = [
    '#العراق_بصورة_أوضح',
    'www.964media.com'
  ];

  return (
    <div className="min-h-screen bg-[#0000ff] flex items-end">
      {/* Main Container at Bottom */}
      <div className="w-full h-20 flex">
        {/* White News Ticker Section - 80% */}
        <div className="w-4/5 bg-white relative overflow-hidden">
          {/* speed is pixels/second; direction 'right' = enter from left, slide to the right */}
          <NewsTickerText newsItems={newsItems} speed={80} direction="right" />
        </div>

        {/* Yellow Container Section - 20% */}
        <div className="w-1/5 bg-[#ffd400] relative">
          <AnimatedTextSlider 
            texts={animatedTexts} 
            intervalMs={20000}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
