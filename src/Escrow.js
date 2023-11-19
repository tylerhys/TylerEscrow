import React from 'react';
import { useDispatch } from 'react-redux';
import { ethers } from 'ethers';
import EscrowABI from './artifacts/contracts/Escrow.sol/Escrow';
import { updateEscrowApprovalStatus } from './escrowSlice';

export default function Escrow({
  address,
  arbiter,
  beneficiary,
  value,
  isApproved
}) {
  const dispatch = useDispatch();

  const handleApprove = async () => {
    try {
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      console.log("Signer:", signer);
      console.log("Address:", address);
      const escrowContract = new ethers.Contract(address, EscrowABI.abi, signer);
      const approveTxn = await escrowContract.connect(signer).approve();
      await approveTxn.wait();
  
      dispatch(updateEscrowApprovalStatus(address));
      // Update UI elements as needed
    } catch (error) {
      if (error.code === -32000 || 
          (error.data && error.data.code === -32000) || 
          (error.error && error.error.code === -32000)) {
        alert("You are not authorised to approve.");
      } else {
        alert("An unknown error occurred.");
      }
    }
  };

  return (
    <div className="existing-contract">
      <ul className="fields">
        <li>
          <div> Arbiter </div>
          <div> {arbiter} </div>
        </li>
        <li>
          <div> Beneficiary </div>
          <div> {beneficiary} </div>
        </li>
        <li>
          <div> Value </div>
          <div> {value} </div>
        </li>
        <button
          className={isApproved ? 'button-disabled' : 'button'}
          onClick={isApproved ? null : handleApprove}
          disabled={isApproved}
        >
          {isApproved ? 'Completed' : 'Approve'}
        </button>
      </ul>
    </div>
  );
}
