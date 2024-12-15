import React, { useState } from "react";

interface Result {
  subject: string;
  grade: string;
}

const App: React.FC = () => {
  const [regdNo, setRegdNo] = useState<string>("");
  const [semester, setSemester] = useState<string>("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [cgpa, setCgpa] = useState<string>("");
  const [sgpa, setSgpa] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Convert semester number to string format
  const convertSemester = (semNum: string): string => {
    const semesterMap: {[key: string]: string} = {
      "1": "Semester-I",
      "2": "Semester-II", 
      "3": "Semester-III",
      "4": "Semester-IV",
      "5": "Semester-V",
      "6": "Semester-VI",
      "7": "Semester-VII",
      "8": "Semester-VIII"
    };
    return semesterMap[semNum] || "";
  };

  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
  
    try {
      const formattedSemester = convertSemester(semester);
      
      const response = await fetch("http://localhost:5000/getResults", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          regdNo, 
          semester: formattedSemester 
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch results");
      }
  
      const data = await response.json();
      
      // Handle case where no data is returned
      if (!data || (Array.isArray(data.subjects) && data.subjects.length === 0)) {
        setCgpa("Results Not Yet Released");
        setSgpa("Results Not Yet Released");
        setResults([]);
        return;
      }
      
      // Process results
      setResults(data.subjects || []);
      setCgpa(data.cgpa || "N/A");
      setSgpa(data.sgpa || "N/A");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regdNo || !semester) {
      setError("Please fill in all fields");
      return;
    }
    fetchResults();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          College Results Scraper
        </h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="regdNo" className="block text-sm font-medium text-gray-700">
              Registration Number
            </label>
            <input
              type="text"
              id="regdNo"
              value={regdNo}
              onChange={(e) => setRegdNo(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your Registration Number"
              required
            />
          </div>

          <div>
            <label htmlFor="semester" className="block text-sm font-medium text-gray-700">
              Semester
            </label>
            <select
              id="semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select Semester</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
              <option value="5">Semester 5</option>
              <option value="6">Semester 6</option>
              <option value="7">Semester 7</option>
              <option value="8">Semester 8</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {loading ? "Fetching Results..." : "Submit"}
          </button>
        </form>

        {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

        {results !== null && (
          <div className="mt-6">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Results:</h2>
            {results.length === 0 ? (
              <div className="text-yellow-600 font-semibold">
                Results Not Yet Released for this Semester
              </div>
            ) : (
              <>
                <table className="w-full text-left border-collapse border border-gray-300">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 px-2 py-1">Subject</th>
                      <th className="border border-gray-300 px-2 py-1">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-2 py-1">{result.subject}</td>
                        <td className="border border-gray-300 px-2 py-1">{result.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4">
                  <p>
                    <strong>SGPA:</strong> {sgpa}
                  </p>
                  <p>
                    <strong>CGPA:</strong> {cgpa}
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;