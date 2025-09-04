import VerticalHeadlines from '@/components/VerticalHeadlines';
import { tsTarek } from '@/app/fonts';
import { WireHeadline } from '@/services/wiresApi';

export const revalidate = 0;

// Server-side data fetching to eliminate fallback flash
async function fetchWiresData(): Promise<WireHeadline[]> {
  try {
    // Use the same API route but call it server-side
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/iraq-wires?limit=20`, {
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Server-side wires fetch error:', error);
    // Return empty array to trigger client-side fallback
    return [];
  }
}

export default async function IraqWiresPage() {
  // Pre-fetch data on server to eliminate flash
  const initialWiresData = await fetchWiresData();
  return (
    <div className="h-screen w-full bg-black relative">
      <div className="h-full w-full flex">
        {/* Left: placeholder column for future content - 30% */}
        <div className="w-[30%] h-full flex items-center justify-center">
          <div className="relative w-[90%] h-[80%] bg-gray-800/40 rounded-lg border border-gray-600/40 flex items-center justify-center">
            <span className={`text-gray-400 ${tsTarek.className}`}>مساحة للمحتوى المستقبلي</span>
          </div>
        </div>

        {/* Right: logo + vertical headlines container - 70% */}
        <div className="w-[70%] h-[90%] flex flex-col relative overflow-hidden ">
          {/* Top: Iraq Wires Logo (contained within right container) */}
          <div className="flex items-center justify-end py-6 px-12">
            <img 
              src="/iraq-wires-logo.svg" 
              alt="Iraq Wires" 
              className="h-16 w-auto"
            />
          </div>
          
          {/* Bottom: Vertical Headlines (strictly contained within parent) */}
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


