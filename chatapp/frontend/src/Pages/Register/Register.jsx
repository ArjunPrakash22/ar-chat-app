import React, { useState } from "react";
import { ethers } from "ethers";
import bcrypt from "bcryptjs";
import Tesseract from "tesseract.js";
import "./Register.css"; // Import your CSS file here
import { CloudUpload } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { CONTRACT_ADDRESS } from "../../abis/constants";
import { initializeApp } from "firebase/app";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";



const Register = () => {
  const [image, setImage] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [name, setName] = useState("");
  const [uniqueId, setUniqueId] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [inputName, setInputName] = useState("");
  const [inputUniqueId, setInputUniqueId] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [verificationResult, setVerificationResult] = useState("");

  const navigate=useNavigate();

  const CONTRACT_ABI = [
    "function addUser(string memory _name, string memory _uniqueId, string memory _gender, string memory _dob) public",
    "function getUser() public view returns (string memory, string memory, string memory, string memory)",
  ];

  const storeIdentityOnBlockchain = async () => {
 
    if (!window.ethereum) {
      alert("Please install MetaMask to interact with the blockchain.");
      return;
    }
 
    try {
      console.log("Requesting accounts...");
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      console.log("hi")
      // Attempt to fetch an existing user with the same uniqueId
      try {
        const existingUser = await contract.getUser();
        
        if (existingUser && existingUser[1] === uniqueId) {
          alert("User with the provided Aadhar number already exists!");
          return;
        }
      } catch (error) {
        console.log("User does not exist yet, proceeding to add new user.");
      }
  
      // Store the new user details on the blockchain
      // const tx = await contract.addUser(name, uniqueId, gender, dob);
      // await tx.wait();
  
      alert("Details successfully stored on the blockchain!");
      await storeCredentialsInFirestore(uniqueId, password,inputName);
      navigate('/');

    } catch (error) {
      console.error("Error storing identity on blockchain:", error.message);
      alert("An error occurred. Please try again.");
    }
  };

  const storeCredentialsInFirestore = async (id, pass,name) => {
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(pass, saltRounds);

      await setDoc(doc(db, "users", id), {
        uniqueId: id,
        password: hashedPassword,
        name: name,
      });

      console.log("Credentials stored in Firestore");
    } catch (error) {
      console.error("Error storing credentials in Firestore:", error.message);
    }
  };
  
  const handleFileUpload = (file) => {
    if (file) {
      setImage(URL.createObjectURL(file));
      performOCR(file);
    }
  };

  const performOCR = (imgFile) => {
    Tesseract.recognize(imgFile, "eng", { logger: (m) => console.log(m) })
      .then(({ data: { text } }) => {
        setExtractedText(text);
        extractDetails(text);
      })
      .catch((err) => console.error(err));
  };

  const extractDetails = (text) => {
    const cleanedText = text
      .replace(/[^\w\s\.\-\/:]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const idPattern = /\b\d{4}\s\d{4}\s\d{4}\b/;
    const idMatch = cleanedText.match(idPattern);
    setUniqueId(idMatch ? idMatch[0] : "Not found");

    const namePattern = /([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)/g;
    const nameMatch = cleanedText.match(namePattern);
    setName(
      nameMatch && nameMatch.length > 0 ? nameMatch[0].trim() : "Not found"
    );

    const genderPattern = /\b(Male|Female|Other)\b/i;
    const genderMatch = cleanedText.match(genderPattern);
    setGender(genderMatch ? genderMatch[0] : "Not found");

    const dobPattern = /\b\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}\b/;
    const dobMatch = cleanedText.match(dobPattern);
    setDob(dobMatch ? dobMatch[0] : "Not found");
  };

  const matchInputWithOCR = () => {
    const normalizedExtractedText = extractedText.toLowerCase();
    const normalizedInputName = inputName.toLowerCase().trim();
    const normalizedInputUniqueId = inputUniqueId.trim();

    const isNamePresent = normalizedExtractedText.includes(normalizedInputName);
    const isUniqueIdPresent = normalizedExtractedText.includes(
      normalizedInputUniqueId
    );

    if (isNamePresent && isUniqueIdPresent) {
      setVerificationResult("Verified");
      setIsVerified(true); // Enable the button
    } else {
      setVerificationResult("Details are not matched");
      setIsVerified(false); // Disable the button
    }
  };

  return (
    <div className="register-page">
      <div className="register-div">
        <h2>Register</h2>
        <div
          className="file-upload-area"
          onClick={() => document.getElementById("file-input").click()}
        >
          <CloudUpload className="cloud-icon" style={{ fontSize: "40px" }} />
          <p className={`file-upload-area-p ${image ? "hidden" : ""}`}>
            Click and drop or Browse
          </p>
          <p className={`file-upload-area-p1 ${image ? "hidden" : ""}`}>
            upload aadhar
          </p>
          <p className={`file-upload-area-p2 ${image ? "hidden" : ""}`}>
            Supported formats: jpeg, png
          </p>
          <input
            id="file-input"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => handleFileUpload(e.target.files[0])}
          />
          {image && (
            <img
              src={image}
              alt="Uploaded Identity Card"
              className="uploaded-image"
            />
          )}
        </div>
        <p>Enter the Details</p>
        <div className="input-container">
          <input
            placeholder="Enter name (as per id)"
            className="text-input"
            type="text"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
          />
          <input
            placeholder="Enter your Aadhar no."
            className="text-input"
            type="text"
            value={uniqueId}
            readOnly
          />
          <input
            placeholder="Gender (Male/Female/Other)"
            className="text-input"
            type="text"
            value={gender}
            readOnly
          />
          <input
            placeholder="Date of Birth (DD/MM/YYYY)"
            className="text-input"
            type="text"
            value={dob}
            readOnly
          />
          <input
            placeholder="Enter your password"
            className="text-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="verify-button"
            onClick={matchInputWithOCR}
            disabled={isVerified}
          >
            Verify
          </button>
          {verificationResult && (
            <h3 className="verification-result">{verificationResult}</h3>
          )}
          <button
            className="verify-button"
            onClick={storeIdentityOnBlockchain}
            disabled={!isVerified}
          >
            Store on Blockchain
          </button>
        </div>
        <a className="register-link" href="/">Already have an account? sign in</a>
      </div>
    </div>
  );
};

export default Register;
