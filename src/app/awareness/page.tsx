import Navigation from '@/components/Navigation';
import { AlertTriangle, Droplets, Trees, Users, Scale, Heart, Phone, Globe } from 'lucide-react';

export default function AwarenessPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Understanding Galamsey
          </h1>
          <p className="text-xl text-gray-600">
            Illegal small-scale mining is destroying Ghana&apos;s environment.
            Learn about the crisis and how you can help.
          </p>
        </div>

        {/* What is Galamsey */}
        <section className="bg-white rounded-xl shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What is Galamsey?</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>Galamsey</strong> is a Ghanaian term derived from the phrase &quot;gather them and sell&quot;.
            It refers to illegal small-scale gold mining operations that have proliferated across Ghana,
            particularly in the Western, Ashanti, and Eastern regions.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            While small-scale mining has existed for centuries, the modern galamsey crisis involves
            heavy machinery, toxic chemicals like mercury and cyanide, and large-scale environmental
            destruction that threatens Ghana&apos;s water sources, forests, and farmland.
          </p>
          <div className="bg-ghana-gold/20 border-l-4 border-ghana-gold p-4 rounded-r-lg">
            <p className="text-gray-800 font-medium">
              Ghana is Africa&apos;s largest gold producer, but up to 35% of gold production comes
              from illegal operations, making enforcement extremely difficult.
            </p>
          </div>
        </section>

        {/* Environmental Impact */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Environmental Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Droplets className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Water Pollution</h3>
              <p className="text-gray-700">
                Over 60% of Ghana&apos;s water bodies are polluted by galamsey activities. Rivers like
                Pra, Ankobra, and Birim have been contaminated with mercury, arsenic, and sediment,
                making them unsafe for drinking, fishing, or irrigation.
              </p>
              <ul className="mt-3 text-sm text-gray-600 space-y-1">
                <li>• Mercury bioaccumulates in fish</li>
                <li>• Sediment destroys aquatic ecosystems</li>
                <li>• Water treatment costs have increased 400%</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Trees className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Deforestation</h3>
              <p className="text-gray-700">
                Ghana has lost 34% of its forest cover since 2000, with galamsey being a major driver.
                Forest reserves, including protected areas like Atewa Forest, have been invaded by
                illegal miners.
              </p>
              <ul className="mt-3 text-sm text-gray-600 space-y-1">
                <li>• 80,000+ hectares destroyed annually</li>
                <li>• Endangered species losing habitat</li>
                <li>• Carbon sink capacity reduced</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Land Degradation</h3>
              <p className="text-gray-700">
                Galamsey operations leave behind massive pits, eroded landscapes, and contaminated soil.
                Agricultural land, including cocoa farms, has been destroyed beyond recovery in many areas.
              </p>
              <ul className="mt-3 text-sm text-gray-600 space-y-1">
                <li>• Cocoa production declining in affected regions</li>
                <li>• Soil contaminated with heavy metals</li>
                <li>• Unfilled pits pose drowning hazards</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Community Impact</h3>
              <p className="text-gray-700">
                Beyond environmental damage, galamsey affects communities through health problems,
                displacement, and social disruption. Children drop out of school to work in mines,
                and conflicts over land have increased.
              </p>
              <ul className="mt-3 text-sm text-gray-600 space-y-1">
                <li>• 5+ million people affected</li>
                <li>• Child labor in mining operations</li>
                <li>• Increased respiratory and skin diseases</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Health Risks */}
        <section className="bg-red-50 border border-red-200 rounded-xl p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-red-900 mb-4">Health Risks</h2>
              <p className="text-red-800 mb-4">
                Mercury and other toxins used in galamsey pose severe health risks:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-red-900">Mercury Poisoning</h4>
                  <ul className="text-red-700 text-sm mt-2 space-y-1">
                    <li>• Neurological damage</li>
                    <li>• Kidney failure</li>
                    <li>• Birth defects</li>
                    <li>• Developmental delays in children</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-red-900">Other Health Effects</h4>
                  <ul className="text-red-700 text-sm mt-2 space-y-1">
                    <li>• Skin rashes and diseases</li>
                    <li>• Respiratory problems from dust</li>
                    <li>• Waterborne diseases</li>
                    <li>• Increased cancer risk</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What Can You Do */}
        <section className="bg-ghana-green text-white rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">What Can You Do?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-bold text-ghana-gold mb-2">Report Incidents</h3>
              <p className="text-green-100">
                Use this platform to report any galamsey activities you observe.
                Anonymous reporting is available. Your information helps authorities
                take action.
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-bold text-ghana-gold mb-2">Spread Awareness</h3>
              <p className="text-green-100">
                Share information about the galamsey crisis with your community.
                Education is key to changing attitudes and reducing participation
                in illegal mining.
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-bold text-ghana-gold mb-2">Support Alternatives</h3>
              <p className="text-green-100">
                Advocate for sustainable livelihoods in mining communities.
                Support programs that provide alternative employment and
                responsible small-scale mining practices.
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="font-bold text-ghana-gold mb-2">Protect Water Sources</h3>
              <p className="text-green-100">
                Monitor local water bodies and report any changes in color or
                quality. Avoid using water from polluted sources and alert
                your community to dangers.
              </p>
            </div>
          </div>
        </section>

        {/* Resources & Contacts */}
        <section className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Resources & Contacts</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                <Phone className="w-5 h-5 text-ghana-green" />
                Report to Authorities
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>
                  <strong>Minerals Commission:</strong>
                  <br />
                  <span className="text-sm">+233 302 773 053</span>
                </li>
                <li>
                  <strong>Environmental Protection Agency:</strong>
                  <br />
                  <span className="text-sm">+233 302 664 697</span>
                </li>
                <li>
                  <strong>Police Emergency:</strong>
                  <br />
                  <span className="text-sm">191 or 18555</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                <Globe className="w-5 h-5 text-ghana-green" />
                Learn More
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>
                  <strong>Ghana EPA</strong>
                  <br />
                  <span className="text-sm">epa.gov.gh</span>
                </li>
                <li>
                  <strong>Water Resources Commission</strong>
                  <br />
                  <span className="text-sm">wrc-gh.org</span>
                </li>
                <li>
                  <strong>Minerals Commission Ghana</strong>
                  <br />
                  <span className="text-sm">mincom.gov.gh</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
              <Scale className="w-5 h-5 text-ghana-green" />
              Legal Framework
            </h3>
            <p className="text-gray-700 text-sm">
              Galamsey is illegal under the Minerals and Mining Act 2006 (Act 703) and the
              Minerals and Mining (Amendment) Act 2015 (Act 900). Penalties include imprisonment
              of up to 25 years and fines. Equipment used in illegal mining can be confiscated.
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-8 text-center">
          <a
            href="/report"
            className="inline-flex items-center gap-2 bg-ghana-red text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition-colors"
          >
            <AlertTriangle className="w-5 h-5" />
            Report Galamsey Activity Now
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            Together we can protect Ghana&apos;s environment for future generations.
          </p>
        </div>
      </footer>
    </div>
  );
}
