import logging
import algokit_utils
from algokit_utils import TransactionParameters, LogicError

logger = logging.getLogger(__name__)

def deploy() -> None:
    from smart_contracts.artifacts.donation_contract.donation_contract_client import (
        DonationContractFactory,
    )

    # Initialize Algorand client and deployer account
    algorand = algokit_utils.AlgorandClient.from_environment()
    deployer = algorand.account.from_environment("DEPLOYER")

    # Get the application factory
    factory = algorand.client.get_typed_app_factory(
        DonationContractFactory, default_sender=deployer.address
    )

    # Deploy the smart contract
    app_client, result = factory.deploy(
        on_update=algokit_utils.OnUpdate.AppendApp,
        on_schema_break=algokit_utils.OnSchemaBreak.AppendApp,
    )

    # Fund the contract with 1 Algo
    if result.operation_performed in [
        algokit_utils.OperationPerformed.Create,
        algokit_utils.OperationPerformed.Replace,
    ]:
        algorand.send.payment(
            algokit_utils.PaymentParams(
                sender=deployer.address,
                receiver=app_client.app_address,
                amount=algokit_utils.AlgoAmount(algo=1),
            )
        )

    logger.info(
        f"Deployed {app_client.app_name} (App ID: {app_client.app_id}) successfully."
    )

    # Call donate() method with payment
    try:
        app_client.donate(
            transaction_parameters=TransactionParameters(
                sender=deployer.address,
                signer=deployer.signer,
                fee=1000,
                amount=algokit_utils.AlgoAmount(algo=0.5),
                allow_log_return=True,
            )
        )
        logger.info("Successfully donated 0.5 Algos to the contract.")
    except LogicError as e:
        logger.error(f"Donate failed: {e}")

    # Call request_withdrawal(amount, reason)
    try:
        app_client.request_withdrawal(
            amount=500_000,  # microAlgos = 0.5 Algos
            reason=b"Community support",
            sender=deployer.address,
            signer=deployer.signer
        )
        logger.info("Withdrawal request submitted successfully.")
    except LogicError as e:
        logger.error(f"Withdrawal request failed: {e}")

    # Call get_total_donations and log the result
    
