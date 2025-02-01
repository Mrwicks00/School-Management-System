import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import abi from './abi.json';
import {ToastContainer, toast} from "react-toastify"

const CONTRACT_ADDRESS = "0x29435702fFaE5465f753748b0d3c639a04068768"

const App = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [retrievedStudent, setRetrievedStudent] = useState(null);

  useEffect(() => {
    const loadBlockchainData = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

        setProvider(provider);
        setSigner(signer);
        setContract(contract);
        setAccount(await signer.getAddress());
      } else {
        alert("Please install MetaMask!");
      }
    };
    loadBlockchainData();
  }, []);

  const registerStudent = async () => {
    if (!contract) return;
    try {
      const tx = await contract.registerStudent(studentName, studentId);
      await tx.wait();
      toast.success("Student registered successfully!")
      alert("Student registered successfully!");
    } catch (error) {
      toast.error(error)
      console.error(error);
    }
  };

  const getStudentById = async () => {
    if (!contract) return;
    try {
      const student = await contract.getStudentById(studentId);
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
      alert("Student removed successfully!");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto text-center">
      <h1 className="text-xl font-bold">Class Registration System</h1>
      <p>Connected Account: {account}</p>
      
      <div className="mt-4">
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
        <button className="bg-blue-500 text-white px-4 py-2 mt-2 w-full" onClick={registerStudent}>Register Student</button>
      </div>
      
      <div className="mt-4">
        <button className="bg-green-500 text-white px-4 py-2 w-full" onClick={getStudentById}>Get Student</button>
        {retrievedStudent && (
          <p className="mt-2">Student: {retrievedStudent.name} (ID: {retrievedStudent.id})</p>
        )}
      </div>
      
      <div className="mt-4">
        <button className="bg-red-500 text-white px-4 py-2 w-full" onClick={removeStudent}>Remove Student</button>
      </div>
      <ToastContainer/>
    </div>
  );
};

export default App;
