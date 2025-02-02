import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import abi from './abi.json';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CONTRACT_ADDRESS = "0x29435702fFaE5465f753748b0d3c639a04068768";

const App = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [retrievedStudent, setRetrievedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [searchId, setSearchId] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

      setProvider(provider);
      setSigner(signer);
      setContract(contract);
      setAccount(await signer.getAddress());
      setIsConnected(true);
    } else {
      alert("Please install MetaMask!");
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setContract(null);
    setAccount(null);
    setIsConnected(false);
  };

  const registerStudent = async () => {
    if (!contract) return;
    try {
      const tx = await contract.registerStudent(studentName, studentId);
      await tx.wait();
      toast.success("Student registered successfully!");
      setStudents([...students, { name: studentName, id: studentId }]);
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    }
  };

  const getStudentById = async () => {
    if (!contract) return;
    try {
      const student = await contract.getStudentById(searchId);
      setRetrievedStudent({ name: student[0], id: student[1].toString() });
    } catch (error) {
      console.error(error);
    }
  };

  const removeStudent = async () => {
    if (!contract) return;
    try {
      const tx = await contract.removeStudent(studentId);
      await tx.wait();
      toast.success("Student removed successfully!");
      setStudents(students.filter(student => student.id !== studentId));
    } catch (error) {
      toast.error(error.message);
      console.error(error);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto text-center">
      <h1 className="text-xl font-bold">Class Registration System</h1>
      <button 
        className={`mt-2 px-4 py-2 rounded ${isConnected ? 'bg-red-500' : 'bg-blue-500'} text-white`}
        onClick={isConnected ? disconnectWallet : connectWallet}
      >
        {isConnected ? "Disconnect Wallet" : "Connect Wallet"}
      </button>
      <p>{account && `Connected Account: ${account}`}</p>

      <div className="flex flex-col gap-4 mt-4">
        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold">Register Student</h2>
          <input 
            type="text" 
            placeholder="Student Name" 
            className="border p-2 w-full" 
            value={studentName} 
            onChange={(e) => setStudentName(e.target.value)} 
          />
          <input 
            type="number" 
            placeholder="Student ID" 
            className="border p-2 w-full mt-2" 
            value={studentId} 
            onChange={(e) => setStudentId(e.target.value)} 
          />
          <button className="bg-blue-500 text-white px-4 py-2 mt-2 w-full" onClick={registerStudent}>Register</button>
        </div>

        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold">Get Student</h2>
          <input 
            type="number" 
            placeholder="Enter Student ID" 
            className="border p-2 w-full" 
            value={searchId} 
            onChange={(e) => setSearchId(e.target.value)} 
          />
          <button className="bg-green-500 text-white px-4 py-2 mt-2 w-full" onClick={getStudentById}>Search</button>
          {retrievedStudent && (
            <p className="mt-2">Student: {retrievedStudent.name} (ID: {retrievedStudent.id})</p>
          )}
        </div>

        <div className="p-4 border rounded">
          <h2 className="text-lg font-semibold">Remove Student</h2>
          <input 
            type="number" 
            placeholder="Student ID" 
            className="border p-2 w-full" 
            value={studentId} 
            onChange={(e) => setStudentId(e.target.value)} 
          />
          <button className="bg-red-500 text-white px-4 py-2 mt-2 w-full" onClick={removeStudent}>Remove</button>
        </div>
      </div>

      <div className="mt-4 p-4 border rounded">
        <h2 className="text-lg font-semibold">Registered Students</h2>
        {students.length > 0 ? (
          <ul className="mt-2">
            {students.map((student, index) => (
              <li key={index} className="p-2 border-b">{student.name} (ID: {student.id})</li>
            ))}
          </ul>
        ) : (
          <p>No students registered yet.</p>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default App;
