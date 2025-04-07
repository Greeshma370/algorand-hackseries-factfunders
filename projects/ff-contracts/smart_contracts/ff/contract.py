from algopy import ARC4Contract, GlobalState, Txn, UInt64, Bytes, Addr
from algopy.arc4 import abimethod

class Ff(ARC4Contract):
    def __init__(self) -> None:
        self.total_donations = GlobalState(UInt64(0), key="total_donations")
        self.dao_admin = GlobalState(Addr("DAO_ADMIN_ADDRESS"), key="dao_admin")  
        self.last_requested_amount = GlobalState(UInt64(0), key="last_req_amt")
        self.last_requested_reason = GlobalState(Bytes(""), key="last_req_reason")

    @abimethod()
    def donate(self) -> None:
        #Allows users to send Algos to the contract and updates total donations.
        self.total_donations.value += Txn.amount

    @abimethod()
    def get_total_donations(self) -> UInt64:
        #Returns the total amount of Algos donated.
        return self.total_donations.value

    @abimethod()
    def request_withdrawal(self, amount: UInt64, reason: Bytes) -> None:
        #Stores the withdrawal request.
        self.last_requested_amount.value = amount
        self.last_requested_reason.value = reason

    @abimethod()
    def approve_withdrawal(self, receiver: Addr) -> None:
        #Only DAO admin can approve and send funds.
        assert Txn.sender == self.dao_admin.value, "Only DAO admin can approve"
        assert self.last_requested_amount.value <= self.total_donations.value, "Insufficient balance"

        # Send Algos from contract to receiver
        self.send_algo(receiver, self.last_requested_amount.value)

        # Deduct from total donations
        self.total_donations.value -= self.last_requested_amount.value

        # Reset request
        self.last_requested_amount.value = UInt64(0)
        self.last_requested_reason.value = Bytes("")

    @abimethod()
    def get_last_request(self) -> tuple[UInt64, Bytes]:
        #Return the latest withdrawal request.
        return self.last_requested_amount.value, self.last_requested_reason.value
