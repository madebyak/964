import VerticalHeadlines from '@/components/VerticalHeadlines';
import { tsTarek } from '@/app/fonts';
import { WireHeadline } from '@/services/wiresApi';

export const revalidate = 0;

async function fetchMeWiresData(country: string = 'global', limit: number = 20): Promise<WireHeadline[]> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const url = new URL('/api/me-wires', baseUrl);
    url.searchParams.set('country', country);
    url.searchParams.set('limit', String(limit));

    const response = await fetch(url.toString(), {
      cache: 'no-cache',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Server-side me-wires fetch error:', error);
    return [];
  }
}

export default async function MeWiresPage() {
  const initialWiresData = await fetchMeWiresData('global', 20);
  const flags = [
    { key: 'gcc', alt: 'GCC', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Flag_of_the_Cooperation_Council_for_the_Arab_States_of_the_Gulf.svg/250px-Flag_of_the_Cooperation_Council_for_the_Arab_States_of_the_Gulf.svg.png' },
    { key: 'egypt', alt: 'Egypt', src: 'https://flagcdn.com/eg.svg' },
    { key: 'jordan', alt: 'Jordan', src: 'https://flagcdn.com/jo.svg' },
    { key: 'palestine', alt: 'Palestine', src: 'https://flagcdn.com/ps.svg' },
    { key: 'yemen', alt: 'Yemen', src: 'https://flagcdn.com/ye.svg' },
    { key: 'turkey', alt: 'Turkey', src: 'https://flagcdn.com/tr.svg' },
    { key: 'iran', alt: 'Iran', src: 'https://flagcdn.com/ir.svg' },
    { key: 'lebanon', alt: 'Lebanon', src: 'https://flagcdn.com/lb.svg' },
    { key: 'syria_new', alt: 'Syria (new flag)', src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Flag_of_Syria_%282025-%29.svg/250px-Flag_of_Syria_%282025-%29.svg.png' },
    { key: 'kurdistan', alt: 'Kurdistan', src: 'https://upload.wikimedia.org/wikipedia/commons/3/35/Flag_of_Kurdistan.svg' },
    { key: 'iraq', alt: 'Iraq', src: 'https://flagcdn.com/iq.svg' },
  ];
  return (
    <div className="h-screen w-full bg-black relative">
      <div className="h-full w-full flex">
        {/* Left: placeholder column for future content - 30% */}
        <div className="w-[30%] h-full flex items-center justify-center">
          <div className="relative w-[90%] h-[80%] bg-gray-800/40 rounded-lg border border-gray-600/40 flex items-center justify-center">
          </div>
        </div>

        {/* Right: logo + vertical headlines container - 70% */}
        <div className="w-[70%] h-[90%] flex flex-col relative overflow-hidden ">
          {/* Top: ME Wires header (RTL): Logo → separator → flags grid */}
          <div className="flex items-center justify-start py-6 px-12 gap-4" dir="rtl">
            {/* Logo */}
            <img src="/Me-logos.svg" alt="ME Wires" className="h-18 w-auto" />
            {/* Vertical separator */}
            <div className="h-12 w-[2px] bg-[#ffd400] rounded" />
            {/* Flags grid (two rows via wrap) */}
            <div className="flex flex-wrap gap-2 max-w-[100%]">
              {flags.map((f) => (
                <div key={f.key} className="w-18 h-12 rounded-md overflow-hidden bg-zinc-900 flex items-center justify-center border border-zinc-700">
                  <img src={f.src} alt={f.alt} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
          {/* Bottom: Vertical Headlines */}
          <div className="flex-1 overflow-hidden px-12 relative w-full h-full max-w-full max-h-full contain-layout">
            <VerticalHeadlines 
              fetchLimit={20} 
              speedPxPerSec={40} 
              initialData={initialWiresData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}


