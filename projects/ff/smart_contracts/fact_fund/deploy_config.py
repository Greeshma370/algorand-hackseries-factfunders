import logging
import algokit_utils

logger = logging.getLogger(__name__)

# Define deployment behavior based on the supplied app spec
def deploy() -> None:
    from smart_contracts.artifacts.fact_fund.fact_fund_client import (
        FactFundFactory,  # Removed HelloArgs since it's not needed
    )

    # Initialize Algorand client and deployer account
    algorand = algokit_utils.AlgorandClient.from_environment()
    deployer_ = algorand.account.from_environment("DEPLOYER")

    # Get the application factory
    factory = algorand.client.get_typed_app_factory(
        FactFundFactory, default_sender=deployer_.address
    )

    # Deploy the smart contract
    app_client, result = factory.deploy(
        on_update=algokit_utils.OnUpdate.AppendApp,
        on_schema_break=algokit_utils.OnSchemaBreak.AppendApp,
    )

    # If the contract is newly created or replaced, send initial funding
    if result.operation_performed in [
        algokit_utils.OperationPerformed.Create,
        algokit_utils.OperationPerformed.Replace,
    ]:
        algorand.send.payment(
            algokit_utils.PaymentParams(
                amount=algokit_utils.AlgoAmount(algo=1),  # Initial funding
                sender=deployer_.address,
                receiver=app_client.app_address,
            )
        )

    logger.info(
        f"Deployed {app_client.app_name} (App ID: {app_client.app_id}) successfully."
    )
