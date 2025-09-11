'use client';

export default function APIFeedSection() {
  const feedPages = [
    {
      src: "/news-ticker",
      title: "News Ticker",
      description: "Classic news ticker layout with horizontal scrolling headlines and real-time updates"
    },
    {
      src: "/news-ticker-2", 
      title: "News Ticker 2",
      description: "Enhanced news ticker design with improved layout and dynamic content presentation"
    },
    {
      src: "/news-ticker-3",
      title: "News Ticker 3",
      description: "Latest news ticker implementation with optimized performance and live data integration"
    },
    {
      src: "/iraq-wires",
      title: "Iraq Wires",
      description: "Live wire service headlines and breaking news feed from Iraq news agencies and sources"
    }
  ];

  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="mb-16">
          {/* Title with Yellow Square */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-4 h-4 bg-[#fcd903]"></div>
            <h2 className="text-2xl md:text-3xl lg:text-5xl font-medium text-white">
              API feed pages
            </h2>
          </div>
          
          {/* Description Paragraph */}
          <p className="text-base md:text-lg text-white/70 font-normal leading-tight max-w-3xl">
            Live preview of dynamic news ticker implementations for +964 media network. These 
            real-time feed pages showcase different layout approaches and API integrations 
            for displaying breaking news and live content updates during broadcasting.
          </p>
        </div>

        {/* Pages Grid - 2 columns on large screens, 1 column on medium/small */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {feedPages.map((page, index) => (
            <div 
              key={index} 
              className="bg-zinc-900/50 rounded-lg overflow-hidden border border-white/10"
            >
              <iframe 
                src={page.src}
                className="aspect-video border-0"
                title={page.title}
                allow="autoplay"
              />
              <div className="p-6">
                <h3 className="text-white font-medium text-lg mb-2">
                  <a 
                    href={page.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#fcd903] transition-colors duration-200 cursor-pointer"
                  >
                    {page.title}
                  </a>
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">{page.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
