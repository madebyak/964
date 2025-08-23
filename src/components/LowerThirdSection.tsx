'use client';

export default function LowerThirdSection() {
  const lowerThirdVideos = [
    {
      src: "/motions/cg-lowerthirds/cg-lowerthird--single 2.mp4",
      title: "Single Lower Third",
      description: "Standard lower third graphic for guest identification and general information display"
    },
    {
      src: "/motions/cg-lowerthirds/cg-lowerthird--breakingsingle.mp4", 
      title: "Breaking News Lower Third",
      description: "Breaking news alert graphic for urgent news updates and live reporting"
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
              Lower third
            </h2>
          </div>
          
          {/* Description Paragraph */}
          <p className="text-base md:text-lg text-white/70 font-normal leading-tight max-w-3xl">
            Professional lower third graphics designed for +964 broadcasting. These motion elements 
            provide essential on-screen information including name tags, titles, breaking news alerts, 
            and contextual information that enhances viewer engagement and brand consistency.
          </p>
        </div>

        {/* Video Grid - 2 columns on large screens, 1 column on medium/small */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {lowerThirdVideos.map((video, index) => (
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
