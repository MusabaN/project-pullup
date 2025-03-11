"use client";
import data from "@/data.json";
import { useState, useEffect } from "react";

type WorkoutSet = {
  type: "banded" | "no-band";
  reps: number;
  checked: boolean;
};

export default function Home() {
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [streak, setStreak] = useState(0);
  const [copyString, setCopyString] = useState("");

  // Load data from localStorage on initial render
  useEffect(() => {
    // Only run on client-side
    if (typeof window === "undefined") return;

    try {
      const savedStreak = localStorage.getItem("pullup-streak");
      if (savedStreak) {
        setStreak(parseInt(savedStreak, 10) || 0);
      }

      const savedSets = localStorage.getItem("pullup-sets");
      if (savedSets) {
        const parsedSets = JSON.parse(savedSets);
        if (Array.isArray(parsedSets)) {
          setSets(parsedSets);
        }
      }
    } catch (err) {
      console.error("Error loading data from localStorage:", err);
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    const updateCopyString = () => {
      let newCopyString = `${new Date().getDate()}/${
        new Date().getMonth() + 1
      }\n`;
      newCopyString += `${data.streak} Streak: ${streak}\n`;
      sets.forEach((set) => {
        if (!set.checked) return;
        const emoji =
          set.type === "banded" ? data.band.emoji : data.normal.emoji;
        const checkEmoji =
          set.type === "banded" ? data.band.check : data.normal.check;
        let repString = "";
        for (let i = 0; i < set.reps; i++) {
          repString += checkEmoji;
          if (i % 5 === 4) {
            repString += " ";
          }
        }
        newCopyString += `${emoji} ${repString}\n`
      });
      setCopyString(newCopyString);
    };
    updateCopyString();

    try {
      localStorage.setItem("pullup-streak", streak.toString());
      localStorage.setItem("pullup-sets", JSON.stringify(sets));
    } catch (err) {
      console.error("Error saving data to localStorage:", err);
    }
  }, [streak, sets]);

  // Add a new set with default values
  const addSet = () => {
    setSets([...sets, { type: "no-band", reps: 0, checked: true }]);
  };

  // Handle type change for a set
  const handleTypeChange = (index: number, newType: "banded" | "no-band") => {
    const updatedSets = [...sets];
    updatedSets[index].type = newType;
    setSets(updatedSets);
  };

  // Handle reps change for a set
  const handleRepsChange = (index: number, newReps: number) => {
    const updatedSets = [...sets];
    updatedSets[index].reps = newReps;
    setSets(updatedSets);
  };

  // Toggle checked status of a set
  const toggleChecked = (index: number) => {
    const updatedSets = [...sets];
    updatedSets[index].checked = !updatedSets[index].checked;
    setSets(updatedSets);
  };

  // Add functions to move sets up and down
  const moveSetUp = (index: number) => {
    if (index === 0) return; // Can't move up if already at the top

    const updatedSets = [...sets];
    // Swap current item with the one above it
    [updatedSets[index - 1], updatedSets[index]] = [
      updatedSets[index],
      updatedSets[index - 1],
    ];
    setSets(updatedSets);
  };

  const moveSetDown = (index: number) => {
    if (index === sets.length - 1) return; // Can't move down if already at the bottom

    const updatedSets = [...sets];
    // Swap current item with the one below it
    [updatedSets[index], updatedSets[index + 1]] = [
      updatedSets[index + 1],
      updatedSets[index],
    ];
    setSets(updatedSets);
  };

  return (
    <>
      <h1>Copy String</h1>
      <div className="bg-white text-black p-4 relative">
        <pre className="max-h-40 overflow-auto">{copyString}</pre>
        <button
          onClick={() => {
            navigator.clipboard.writeText(copyString)
            alert("Copied to clipboard!")
          }}
          className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-sm cursor-pointer"
        >
          Copy
        </button>
      </div>

      <h1>Streak</h1>
      <h2>{streak}</h2>
      <div>
        <button
          className="p-2 m-2 bg-white text-black"
          onClick={() => setStreak(streak + 1)}
        >
          Increment
        </button>
        <button
          className="p-2 m-2 bg-white text-black"
          onClick={() => setStreak(0)}
        >
          Reset
        </button>
      </div>
      <h1 className="text-2xl font-bold mb-4">Sets</h1>
      {/* List of sets */}
      {sets.map((set, i) => (
        <div key={i} className="border p-3 mb-3 rounded">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold mr-2">Set {i + 1}</h2>
              <div className="flex flex-col">
                <button
                  onClick={() => moveSetUp(i)}
                  className={`px-1 text-sm ${
                    i === 0 ? "text-gray-400" : "text-blue-500"
                  }`}
                  disabled={i === 0}
                >
                  ▲
                </button>
                <button
                  onClick={() => moveSetDown(i)}
                  className={`px-1 text-sm ${
                    i === sets.length - 1 ? "text-gray-400" : "text-blue-500"
                  }`}
                  disabled={i === sets.length - 1}
                >
                  ▼
                </button>
              </div>
            </div>
            <div>
            <button onClick={() => setSets(sets.filter((_, j) => j !== i))}>
              <span role="img" aria-label="Delete set">
                ❌
              </span> 
            </button>
            <button
              onClick={() => toggleChecked(i)}
              className={`w-6 h-6 border flex items-center justify-center ${
                set.checked ? "bg-green-100" : ""
              }`}
            >
              {set.checked ? "✓" : ""}
            </button>
            </div>
          </div>

          <div className="mb-2">
            <select
              value={set.type}
              onChange={(e) =>
                handleTypeChange(i, e.target.value as "banded" | "no-band")
              }
              className="border p-1 rounded w-full"
            >
              <option value="banded">Banded</option>
              <option value="no-band">No band</option>
            </select>
          </div>

          <div className="flex items-center">
            <label className="mr-2">Reps:</label>
            <input
              type="number"
              value={set.reps}
              onChange={(e) =>
                handleRepsChange(i, parseInt(e.target.value) || 0)
              }
              className="border p-1 rounded w-20"
              min="0"
            />
          </div>
        </div>
      ))}

      {/* Add new set button */}
      <button
        onClick={addSet}
        className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
      >
        <span className="mr-1">+</span> Add Set
      </button>
    </>
  );
}
