import React, { useState, useEffect } from "react";
import logo from '../src/assets/logo.png'

// Icons for better visual feedback
import { 
  AlertCircle, 
  CheckCircle2, 
  ChartLine, 
  RefreshCw, 
  BarChart2 
} from 'lucide-react';

interface Result {
  subject: string;
  grade: string;
}

interface PerformanceTrend {
  gradeTrend: number[];
  overallPerformance: string | null;
}

const App: React.FC = () => {
  // State management with more detailed tracking
  const [regdNo, setRegdNo] = useState<string>("");
  const [semester, setSemester] = useState<string>("");
  const [results, setResults] = useState<Result[] | null>(null);
  const [cgpa, setCgpa] = useState<string>("");
  const [sgpa, setSgpa] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // New state for performance tracking
  const [performanceTrend, setPerformanceTrend] = useState<PerformanceTrend | null>(null);
  const [allSemesterResults, setAllSemesterResults] = useState<any[] | null>(null);

  // Caching mechanism for recent searches
  const [recentSearches, setRecentSearches] = useState<Array<{regdNo: string, semester: string}>>(() => {
    // Retrieve from local storage on initial load
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  });

  // Update local storage when recent searches change
  useEffect(() => {
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  // Convert semester number to string format
  const convertSemester = (semNum: string): string => {
    const semesterMap: {[key: string]: string} = {
      "1": "Semester-I", "2": "Semester-II", "3": "Semester-III", "4": "Semester-IV",
      "5": "Semester-V", "6": "Semester-VI", "7": "Semester-VII", "8": "Semester-VIII"
    };
    return semesterMap[semNum] || "";
  };

  // Enhanced fetch results method
  const fetchResults = async (fetchAll: boolean = false) => {
    setLoading(true);
    setError(null);
    setResults(null);
    setPerformanceTrend(null);
    setAllSemesterResults(null);
  
    try {
      const formattedSemester = convertSemester(semester);
      
      // Add to recent searches (limit to 5 recent)
      const newSearch = { regdNo, semester: formattedSemester };
      setRecentSearches(prev => {
        const updated = [
          newSearch, 
          ...prev.filter(search => 
            search.regdNo !== newSearch.regdNo || 
            search.semester !== newSearch.semester
          )
        ].slice(0, 5);
        return updated;
      });

      const endpoint = fetchAll ? "/getAllResults" : "/getResults";
      
      const response = await fetch(`http://localhost:5000${endpoint}`, {
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
      
      if (fetchAll) {
        // Handle all semester results
        setAllSemesterResults(data.semesterResults);
        setPerformanceTrend(data.performanceTrend);
      } else {
        // Handle single semester results
        if (!data || (Array.isArray(data.subjects) && data.subjects.length === 0)) {
          setCgpa("Results Not Yet Released");
          setSgpa("Results Not Yet Released");
          setResults([]);
          return;
        }
        
        setResults(data.subjects || []);
        setCgpa(data.cgpa || "N/A");
        setSgpa(data.sgpa || "N/A");
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent, fetchAll: boolean = false) => {
    e.preventDefault();
    if (!regdNo || !semester) {
      setError("Please fill in all fields");
      return;
    }
    fetchResults(fetchAll);
  };

  // Render performance trend visualization
  const renderPerformanceTrend = () => {
    if (!performanceTrend) return null;

    return (
      <div className="mt-4 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 flex items-center">
          <ChartLine className="mr-2 text-indigo-600" />
          Performance Trend
        </h3>
        <div className="flex justify-between">
          <div>
            <p className="text-sm">Grade Trend:</p>
            <div className="flex">
              {performanceTrend.gradeTrend.map((cgpa, index) => (
                <span 
                  key={index} 
                  className="mx-1 text-sm font-bold"
                  style={{
                    color: cgpa >= 8.5 ? 'green' : 
                           cgpa >= 7.5 ? 'blue' : 
                           cgpa >= 6.5 ? 'orange' : 'red'
                  }}
                >
                  {cgpa.toFixed(2)}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm">Overall Performance:</p>
            <p 
              className={`font-bold ${
                performanceTrend.overallPerformance === 'Excellent' ? 'text-green-600' :
                performanceTrend.overallPerformance === 'Very Good' ? 'text-blue-600' :
                performanceTrend.overallPerformance === 'Good' ? 'text-yellow-600' :
                'text-red-600'
              }`}
            >
              {performanceTrend.overallPerformance}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Render recent searches
  // const renderRecentSearches = () => {
  //   if (recentSearches.length === 0) return null;

  //   return (
  //     <div className="mt-4 bg-gray-50 p-4 rounded-lg">
  //       <h3 className="text-lg font-semibold mb-2 flex items-center">
  //         <RefreshCw className="mr-2 text-indigo-600" />
  //         Recent Searches
  //       </h3>
  //       <div className="grid grid-cols-2 gap-2">
  //         {recentSearches.map((search, index) => (
  //           <button
  //             key={index}
  //             onClick={() => {
  //               setRegdNo(search.regdNo);
  //               setSemester(search.semester.replace('Semester-', ''));
  //             }}
  //             className="text-sm bg-white border border-gray-200 rounded-md p-2 hover:bg-gray-100 transition"
  //           >
  //             {search.regdNo} - {search.semester}
  //           </button>
  //         ))}
  //       </div>
  //     </div>
  //   );
  // };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
         <img
    src={logo}
    alt="Logo"
    className="absolute top-4 left-4 w-16 h-16"
  />
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 relative">
   
        <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          SRKR Results Dashboard
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
              {["1", "2", "3", "4", "5", "6", "7", "8"].map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-grow py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center justify-center"
            >
              {loading ? "Fetching Results..." : "Get Semester Results"}
              {loading && <RefreshCw className="ml-2 animate-spin" />}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              className="flex-grow py-2 px-4 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center"
            >
              <BarChart2 className="mr-2" /> Full Academic History
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 flex items-center text-red-600 text-sm">
            <AlertCircle className="mr-2" /> {error}
          </div>
        )}

        {results !== null && (
          <div className="mt-6">
            <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
              <CheckCircle2 className="mr-2 text-green-600" /> Results
            </h2>
            {results.length === 0 ? (
              <div className="text-yellow-600 font-semibold flex items-center">
                <AlertCircle className="mr-2" /> Results Not Yet Released for this Semester
              </div>
            ) : (
              <>
                <table className="w-full text-left border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-2 py-1">Subject</th>
                      <th className="border border-gray-300 px-2 py-1">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-2 py-1">{result.subject}</td>
                        <td className="border border-gray-300 px-2 py-1">{result.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 bg-gray-50 p-3 rounded-md">
                  <p className="flex items-center">
                    <strong className="mr-2">SGPA:</strong> 
                    <span className={`font-bold ${sgpa !== 'N/A' && parseFloat(sgpa) >= 7.5 ? 'text-green-600' : 'text-red-600'}`}>
                      {sgpa}
                    </span>
                  </p>
                  <p className="flex items-center">
                    <strong className="mr-2">CGPA:</strong> 
                    <span className={`font-bold ${cgpa !== 'N/A' && parseFloat(cgpa) >= 7.5 ? 'text-green-600' : 'text-red-600'}`}>
                      {cgpa}
                    </span>
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {performanceTrend && renderPerformanceTrend()}
        {allSemesterResults && (
          <div className="mt-6">
            <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
              <BarChart2 className="mr-2 text-indigo-600" /> All Semester Results
            </h2>
            <table className="w-full text-left border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-2 py-1">Semester</th>
                  <th className="border border-gray-300 px-2 py-1">SGPA</th>
                  <th className="border border-gray-300 px-2 py-1">CGPA</th>
                </tr>
              </thead>
              <tbody>
                {allSemesterResults.map((semesterResult, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-2 py-1">{semesterResult.semester}</td>
                    <td className="border border-gray-300 px-2 py-1">{semesterResult.sgpa}</td>
                    <td className="border border-gray-300 px-2 py-1">{semesterResult.cgpa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* {renderRecentSearches()} */}
      </div>
    </div>
  );
};

export default App;