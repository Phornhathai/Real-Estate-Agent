import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "About Us — Home Reality",
  description:
    "Meet our team of experienced real estate agents dedicated to helping you find your perfect home.",
};

export default async function AboutPage() {
  const agents = await prisma.agent.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About Home Reality</h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          We're a team of passionate real estate professionals dedicated to helping you find the
          perfect property across Thailand — whether you're buying, renting, or investing.
        </p>
      </div>

      {/* Why choose us */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        {[
          {
            icon: "🏆",
            title: "Trusted Experience",
            desc: "Over 10 years helping clients find their dream homes across Thailand.",
          },
          {
            icon: "🔍",
            title: "Curated Listings",
            desc: "Every property is carefully selected and verified to match the highest standards.",
          },
          {
            icon: "🤝",
            title: "Personal Service",
            desc: "Dedicated agent support from your first inquiry to the day you get your keys.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="bg-white rounded-xl border border-gray-100 p-6 text-center"
          >
            <div className="text-4xl mb-3">{item.icon}</div>
            <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Team */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Meet Our Team</h2>

        {agents.length === 0 ? (
          <p className="text-center text-gray-400">Coming soon</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="bg-white rounded-xl border border-gray-100 p-6 text-center"
              >
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 mx-auto mb-4">
                  {agent.avatar ? (
                    <Image
                      src={agent.avatar}
                      alt={agent.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl font-bold">
                      {agent.name[0]}
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{agent.name}</h3>
                <p className="text-xs text-gray-500 mb-3">{agent.experience} years experience</p>
                <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3">
                  {agent.bio}
                </p>
                {/* <div className="flex justify-center gap-3 text-xs text-gray-500">
                  <span>{agent.totalListings} listings</span>
                </div> */}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-blue-600 rounded-2xl p-10 text-center text-white">
        <h2 className="text-2xl font-bold mb-3">Ready to find your perfect home?</h2>
        <p className="text-blue-100 mb-6">
          Browse our curated listings across Bangkok, Chiang Mai, Phuket and more.
        </p>
        <div className="flex justify-center gap-3 flex-wrap">
          <Link
            href="/listings"
            className="px-6 py-2.5 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
          >
            Browse Properties
          </Link>
          <Link
            href="/contact"
            className="px-6 py-2.5 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-400 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </main>
  );
}
