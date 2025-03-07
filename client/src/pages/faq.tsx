import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { SiMetabase } from "react-icons/si";

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Building on Electroneum</h1>

        <div className="space-y-8">
          {/* Network Information */}
          <section className="bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Network Information</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <dl className="space-y-2">
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="font-medium text-gray-600">Network Name:</dt>
                    <dd className="col-span-2">Electroneum Mainnet</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="font-medium text-gray-600">Chain ID:</dt>
                    <dd className="col-span-2">52014</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="font-medium text-gray-600">EVM Version:</dt>
                    <dd className="col-span-2">London</dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>

          {/* RPC Endpoints */}
          <section className="bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">RPC Endpoints</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Available RPC URLs</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>ETN: <code className="bg-gray-100 px-2 py-1 rounded">https://rpc.electroneum.com</code></li>
                  <li>Ankr: <code className="bg-gray-100 px-2 py-1 rounded">https://rpc.ankr.com/electroneum</code></li>
                </ul>
              </div>
            </div>
          </section>

          {/* Developer Resources */}
          <section className="bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Developer Resources</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Documentation & Tools</h3>
                <ul className="space-y-3">
                  <li>
                    <a 
                      href="https://developer.electroneum.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-700"
                    >
                      Developer Documentation <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://github.com/electroneum/electroneum-sc"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-700"
                    >
                      Smart Contract Repository <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://chainlist.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-700"
                    >
                      Chainlist (Easy Network Configuration) <ExternalLink className="w-4 h-4 ml-1" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Block Explorers */}
          <section className="bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Block Explorers</h2>
            <div className="space-y-4">
              <ul className="space-y-3">
                <li>
                  <a 
                    href="https://blockexplorer.electroneum.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-700"
                  >
                    Main Explorer <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </li>
                <li>
                  <a 
                    href="https://legacy-blockexplorer.electroneum.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-700"
                  >
                    Legacy Explorer <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </li>
              </ul>
            </div>
          </section>

          {/* Additional Resources */}
          <section className="bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Additional Resources</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Bug Reports & Support</h3>
                <a 
                  href="https://bugcrowd.com/electroneum"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-700"
                >
                  Submit Vulnerability Reports <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
              <div>
                <h3 className="font-medium mb-2">Current Events</h3>
                <a 
                  href="https://electroneum-hackathon-2025.devpost.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-700"
                >
                  Hackathon (Jan-Mar 2025) <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}