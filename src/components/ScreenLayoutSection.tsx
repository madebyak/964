'use client';

export default function ScreenLayoutSection() {
  const screenLayoutVideos = [
    {
      src: "/screen-layout/bg-loop-1920.mp4",
      title: "Background Loop 1920",
      description: "Full HD background loop design for live event broadcasting and content overlay applications"
    },
    {
      src: "/screen-layout/bg-loop-chroma-01.mp4", 
      title: "Chroma Background Loop",
      description: "Green screen compatible background loop for virtual set integration and content keying"
    },
    {
      src: "/screen-layout/bg-loop-chroma-01_1.mp4",
      title: "Chroma Loop Variant",
      description: "Alternative chroma key background with enhanced motion graphics for dynamic live events"
    },
    {
      src: "/screen-layout/bg-loop-chroma-1-3.mp4",
      title: "Extended Chroma Loop",
      description: "Extended duration chroma background loop for longer segments and continuous broadcasting"
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
              Screen layout
            </h2>
          </div>
          
          {/* Description Paragraph */}
          <p className="text-base md:text-lg text-white/70 font-normal leading-tight max-w-3xl">
            Comprehensive screen layout templates for +964 live event broadcasting. These chroma key 
            backgrounds and motion graphics provide the foundation for dynamic content presentation, 
            virtual set integration, and real-time information display during live programming.
          </p>
        </div>

        {/* Video Grid - 2 columns on large screens, 1 column on medium/small */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {screenLayoutVideos.map((video, index) => (
            <div 
              key={index} 
              className="bg-zinc-900/50 rounded-lg overflow-hidden border border-white/10"
            >
              <video 
                className="w-full h-auto aspect-video object-contain bg-zinc-950"
                autoPlay 
                loop 
                muted 
                playsInline
              >
                <source src={video.src} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="p-6">
                <h3 className="text-white font-medium text-lg mb-2">{video.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{video.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
