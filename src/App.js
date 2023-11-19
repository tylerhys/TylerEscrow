import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addEscrow, setEscrows, updateEscrowApprovalStatus } from './escrowSlice'; // Import your Redux actions
import deploy from './deploy';
import Escrow from './Escrow';
import { ethers } from 'ethers';

const provider = new ethers.providers.Web3Provider(window.ethereum);

export async function approve(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).approve();
  await approveTxn.wait();
}

function App() {
  const dispatch = useDispatch(); // Hook to dispatch actions
  const escrows = useSelector((state) => state.escrows); // Selector to access Redux state
  const [account, setAccount] = useState();
  const [signer, setSigner] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const itemsPerPage = 5;

  const filteredEscrows = escrows.filter(escrow =>
    escrow.arbiter.includes(searchQuery) ||
    escrow.beneficiary.includes(searchQuery)
  );

  const sortedEscrows = [...filteredEscrows].reverse();
  const totalContracts = sortedEscrows.length;
  const totalPages = Math.ceil(totalContracts / itemsPerPage);

// Function to change page
  const setPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  // Calculate the slice of escrows to display
  const displayedEscrows = sortedEscrows .slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    async function getAccounts() {
      const accounts = await provider.send('eth_requestAccounts', []);

      setAccount(accounts[0]);
      setSigner(provider.getSigner());
    }

    getAccounts();

    // Load escrows from local storage or backend here and dispatch to Redux
    // const storedEscrows = localStorage.getItem('escrows');
    // if (storedEscrows) {
    //   dispatch(setEscrows(JSON.parse(storedEscrows)));
    // }
  }, [dispatch]);

  async function newContract() {
    const beneficiary = document.getElementById('beneficiary').value.trim();
    const arbiter = document.getElementById('arbiter').value.trim();
    const value = document.getElementById('wei').value.toString().trim();
    console.log("APP Signer:", signer);

    // Ethereum address validation regex
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    
    if (!ethAddressRegex.test(arbiter)) {
      alert("Error: Invalid Ethereum address format for Arbiter.");
      return;
    }

    if (!ethAddressRegex.test(beneficiary)) {
      alert("Error: Invalid Ethereum address format for Beneficiary.");
      return;
    }
    
    const isDuplicate = (beneficiary === arbiter || arbiter === provider.getSigner() || beneficiary === provider.getSigner());
  
    if (isDuplicate) {
      alert("Warning: Duplicate Address detected.");
      return; // Exit the function to prevent adding a duplicate contract
    }

    const escrowContract = await deploy(signer, arbiter, beneficiary, value);

    const escrow = {
      address: escrowContract.address,
      arbiter,
      beneficiary,
      value: value.toString(),
      isApproved: false
    };

    dispatch(addEscrow(escrow));
  }

  return (
    <>
    <div className="app-container">
      <div className="contract">
      <img src="art.png" alt="Logo" style={{ width:500}} />
        <label>
          Arbiter Address
          <input type="text" id="arbiter" />
        </label>

        <label>
          Beneficiary Address
          <input type="text" id="beneficiary" />
        </label>

        <label>
          Deposit Amount (in ETH)
          <input type="text" id="wei" />
        </label>

        <div
          className="button"
          id="deploy"
          onClick={(e) => {
            e.preventDefault();

            newContract();
          }}
        >
          Deploy
        </div>
      </div>

            <div className="existing-contracts">
        <h1> Existing Contracts </h1>
        <input
          type="text"
          placeholder="Search by address"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {totalContracts === 0 ? (
          <p>No contracts found.</p>
        ) : (
          <div id="container">
            {displayedEscrows.map((escrow) => (
              <Escrow key={escrow.address} {...escrow} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1}>
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages}>
              Next
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

export default App;
