/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
const CodeEditor = ({ code, language }) => (
    <div className="w-full rounded-lg bg-gray-900 shadow-lg">
      <div className="flex items-center px-4 py-2 border-b border-gray-800">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
      </div>
      <div className="p-4 overflow-auto max-h-96">
        <pre className="text-gray-300 font-mono text-sm">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );

export default CodeEditor