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

        <h1 className="text-4xl font-bold mb-8">Connecting to Electroneum Mainnet</h1>

        <div className="space-y-8">
          {/* MetaMask Setup Section */}
          <section className="bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <SiMetabase className="text-[#F6851B]" />
              Setting Up MetaMask
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600">
                To interact with Spirit Journal on the Electroneum mainnet, you'll need to:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>Install the MetaMask browser extension if you haven't already</li>
                <li>Click the MetaMask extension icon and unlock your wallet</li>
                <li>Click the network dropdown at the top of MetaMask</li>
                <li>Select "Add Network" and choose "Add Network Manually"</li>
              </ol>
            </div>
          </section>

          {/* Network Configuration */}
          <section className="bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Network Configuration</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Mainnet Details</h3>
                <dl className="space-y-2">
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="font-medium text-gray-600">Network Name:</dt>
                    <dd className="col-span-2">Electroneum Mainnet</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="font-medium text-gray-600">RPC URL:</dt>
                    <dd className="col-span-2">https://rpc.ankr.com/electroneum</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="font-medium text-gray-600">Chain ID:</dt>
                    <dd className="col-span-2">52014</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="font-medium text-gray-600">Currency Symbol:</dt>
                    <dd className="col-span-2">ETN</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <dt className="font-medium text-gray-600">Block Explorer:</dt>
                    <dd className="col-span-2">https://blockexplorer.electroneum.com/</dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>

          {/* Getting ETN */}
          <section className="bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Getting ETN</h2>
            <p className="text-gray-600 mb-4">
              To interact with Spirit Journal on mainnet, you'll need ETN tokens. You can acquire ETN through:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Official Electroneum exchange partners</li>
              <li>Direct purchase through supported platforms</li>
              <li>Community trading platforms</li>
            </ul>
          </section>

          {/* Useful Resources */}
          <section className="bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Useful Resources</h2>
            <div className="grid gap-4">
              <a 
                href="https://developer.electroneum.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-md border hover:bg-gray-50"
              >
                <div>
                  <h3 className="font-medium">Developer Documentation</h3>
                  <p className="text-sm text-gray-600">Official Electroneum developer resources</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
              <a 
                href="https://chainlist.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-md border hover:bg-gray-50"
              >
                <div>
                  <h3 className="font-medium">Chainlist</h3>
                  <p className="text-sm text-gray-600">Easy network configuration through Chainlist</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
              <a 
                href="https://testnet-blockexplorer.electroneum.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-md border hover:bg-gray-50"
              >
                <div>
                  <h3 className="font-medium">Testnet Block Explorer</h3>
                  <p className="text-sm text-gray-600">Track transactions and smart contracts on testnet</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}