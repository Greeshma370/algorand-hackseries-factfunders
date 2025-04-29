from smart_contracts.artifacts.ff.proposal_contract_client import (ProposalContractClient)
from algokit_utils import AlgorandClient
from algosdk.atomic_transaction_composer import EmptySigner
from rich.pretty import pprint
app_id = 1002

proposal_id = 0

algorand = AlgorandClient.default_localnet()

read_account = "A7NMWS3NT3IUDMLVO26ULGXGIIOUQ3ND2TXSER6EBGRZNOBOUIQXHIBGDE"

proposal_contract_client = ProposalContractClient(algorand=algorand,app_id=app_id,default_sender=read_account, default_signer=EmptySigner())

proposal_box = proposal_contract_client.state.box.proposals.get_value(proposal_id)

pprint(proposal_box)

milestone_votes = proposal_contract_client.state.box.milestone_votes.get_value(proposal_id)

pprint(milestone_votes)
