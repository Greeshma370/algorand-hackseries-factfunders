from algopy import ARC4Contract, String
from algopy.arc4 import abimethod


class FactFund(ARC4Contract):
    @abimethod()
    def hello(self, name: String) -> String:
        return "Hello, " + name
