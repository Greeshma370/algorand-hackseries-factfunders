from algopy import ARC4Contract, GlobalState, Txn, UInt64
from algopy.arc4 import abimethod

class DonationContract(ARC4Contract):
    def __init__(self) -> None:
        self.total_donations = GlobalState(UInt64(0), key="total_donations")

    @abimethod()
    def donate(self) -> None:
        """Allows users to send Algos to the contract and updates total donations."""
        self.total_donations.value += Txn.amount

    @abimethod()
    def get_total_donations(self) -> UInt64:
        """Returns the total amount of Algos donated."""
        return self.total_donations.value
