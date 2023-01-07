### Libs/Workflow Topics

- [Specification Assumptions](#specification-assumptions)
- [Workflow Definition Basics](#workflow-definition-basics)
  - [Basic Functions](#basic-functions)
  - [Basic Input Object](#basic-input-object)
    - [Definition {#basic-input-object-definition}](#definition-basic-input-object-definition)
    - [Transformations {#basic-input-object-transformations}](#transformations-basic-input-object-transformations)
  - [Basic States](#basic-states)
    - [Basic Step State](#basic-step-state)
    - [Basic Transition State](#basic-transition-state)
    - [Basic Finalization State](#basic-finalization-state)
- [FAQ](#faq)
  - [What is the difference between Step and State?](#what-is-the-difference-between-step-and-state)

## Specification Assumptions

There are some assumptions made by this project that are important to be followed.

- Every [Worflow State](https://github.com/serverlessworkflow/specification/blob/main/specification.md#workflow-states) MUST include the `id` and `name` attributes and those attributes MUST be unique.
  - The `name` attribute MUST NOT be equal to the string `defaultCondition`.
- Every [Action](https://github.com/serverlessworkflow/specification/blob/main/specification.md#Action-Definition) MUST include the `name` attribute.
- Every [Action](https://github.com/serverlessworkflow/specification/blob/main/specification.md#Action-Definition) that references the function that request datasources MUST be called `RequestServicesAction`.
  - **Reason**: When we check if all datasources are available we need a way to identify which action has the information of the required datasources.

## Workflow Definition Basics

### Basic Functions

Those are functions that MUST exist in every workflow so it can be able to perform the basic operations.

- `RequestServicesFn`
  - **Description**: Function responsible for invoking a Lambda that will request the services passed in the payload.
  - **Definition**:
    ```json
    {
    	"name": "RequestServicesFn",
    	"operation": "arn:aws:lambda:us-east-1:566163553601:function:newpet-dev-request-services",
    	"metadata": {
    		"method": "lambda"
    	},
    	"type": "custom"
    }
    ```
- `ValidateRulesFn`
  - **Description**: Function responsible for invoking a Lambda that will execute the validations for the defined rules.
  - **Definition**:
    ```json
    {
    	"name": "ValidateRulesFn",
    	"operation": "arn:aws:lambda:us-east-1:566163553601:function:newpet-dev-rules-runtime",
    	"metadata": {
    		"method": "lambda"
    	},
    	"type": "custom"
    }
    ```
- `PushToValidationsArrayFn`
  - **Description**: Function responsible for pushing the last validation of the step to the `validations` property of the input and also setting the `.transactions.validations` by ovewriting it.
  - **Definition**:
    ```json
    {
    	"name": "PushToValidationsArrayFn",
    	"operation": ".validations += .lastStepValidations | .transaction.validations = .validations",
    	"type": "expression"
    }
    ```
- `PushToServicesDataArrayFn`
  - **Description**: Function responsible for pushing the last services data to the `servicesData` property of the input.
  - **Definition**:
    ```json
    {
    	"name": "PushToServicesDataArrayFn",
    	"operation": ".servicesData += .lastServicesData",
    	"type": "expression"
    }
    ```
- `IsApprovedFn`
  - **Description**: Function responsible for checking whether the last step was approved or not.
  - **Definition**:
    ```json
    {
    	"name": "IsApprovedFn",
    	"operation": ".lastStepValidations | map(.status) | all(. == \"APPROVED\")",
    	"type": "expression"
    }
    ```
- `ConvertServicesDataToSectionsFn`
  - **Description**: Function responsible for converting the array of objects `servicesData` into a single object whose keys are the `serviceName` and the value is `data` from the original object in the `servicesData` array.
  - **Definition**:
    ```json
    {
    	"name": "ConvertServicesDataToSectionsFn",
    	"operation": ".servicesData | to_entries | map(.value) | map(.[.serviceName] = .data) | map(delpaths([[\"status\"], [\"data\"], [\"serviceName\"]])) | add",
    	"type": "expression"
    }
    ```

### Basic Input Object

#### Definition {#basic-input-object-definition}

The input object expected to make the workflow work is the following:

<details><summary><strong>Click to view the definition</strong></summary>

```ts
{
  /**
   * Tenant Id associated with the transaction.
   */
  tenantId: string;

  /**
   * Id of the Workflow definition.
   */
  workflowDefinitionId: string;

  /**
   * Transaction populated with all fields available at the database.
   */
  transaction: TransactionLeanDocument;

  /**
   * State that we should start the processing from.
   * This property should not be set if you want to resume suspended workflows.
   */
  startStateName?: string;
}
```

</details>

#### Transformations {#basic-input-object-transformations}

The [input object](#basic-input-object-definition) is transformed as it traverses the states in the workflow. Properties added are the following:

<details><summary><strong>Click to view the definition</strong></summary>

```ts
{
  /**
   * The services data from the last step.
   */
  lastServicesData: Array<{
    /**
     * Status of the service request.
     * Those are HTTP statuses.
     */
    status: number;
    /**
     * Data received for the requested service.
     */
    data: unknown;
    /**
     * Requested service name.
     */
    serviceName: string;
  }>;

  /**
   * All services data received so far.
   */
  servicesData: Array<{
    /**
     * Status of the service request.
     * Those are HTTP statuses.
     */
    status: number;
    /**
     * Data received for the requested service.
     */
    data: unknown;
    /**
     * Requested service name.
     */
    serviceName: string;
  }>

  /**
   * The validations of the last step. This property is important for us
   * to know if the last step was approved or reproved.
   */
  lastStepValidations: Array<{
    ruleName: string;
    ruleId: string;
    status: string; // Validation status (APPROVED or REPROVED)
  }>;

  /**
   * All validations so far in the Workflow.
   */
  validations: Array<{
    ruleName: string;
    ruleId: string;
    status: string; // Validation status (APPROVED or REPROVED)
  }>;

  /**
   * This property indicates whether the workflow has completed or not. If true then
   * the transaction status can be infered from the lastStepValidations.
   */
  end: boolean;
}
```

</details>

### Basic States

#### Basic Step State

This state is responsible for requesting the services and validating the rules
and the result of those actions will be merged into the input and processed by the next state.
**Definition:**

<details><summary><strong>Click to view the definition</strong></summary>

```json
{
	"id": "RANDOMID",
	"name": "Step-RANDOMID",
	"type": "operation",
	"actions": [
		{
			"name": "RequestServicesAction",
			"functionRef": {
				"refName": "RequestServicesFn",
				"arguments": {
					"payload": {
						"transaction": "${ .transaction }",
						"tenantId": "${ .tenantId }",
						"services": [
							{
								"name": "facematch"
							}
						]
					}
				}
			},
			"actionDataFilter": {
				"results": "${ .data }",
				"toStateData": "${ .lastServicesData }"
			}
		},
		{
			"name": "PushToServicesDataArray-RANDOMID",
			"functionRef": {
				"refName": "PushToServicesDataArrayFn"
			}
		},
		{
			"name": "ConvertServicesDataToSections-RANDOMID",
			"functionRef": {
				"refName": "ConvertServicesDataToSectionsFn"
			},
			"actionDataFilter": {
				"toStateData": "${ .transaction.sections }"
			}
		},
		{
			"name": "ValidateRulesAction",
			"functionRef": {
				"refName": "ValidateRulesFn",
				"arguments": {
					"payload": {
						"transaction": "${ .transaction }",
						"rules": [
							{
								"_id": "63ad76b63e8a9325b256bce9",
								"type": "SHARED"
							}
						]
					}
				}
			},
			"actionDataFilter": {
				"toStateData": "${ .lastStepValidations }"
			}
		},
		{
			"name": "PushToValidationArray-RANDOMID",
			"functionRef": {
				"refName": "PushToValidationsArrayFn"
			}
		}
	],
	"transition": "Switch-RANDOMID"
	// If this is the last state, then you can change "transition" for "end": true
}
```

</details>

#### Basic Transition State

This state is responsible for transitioning to the next state or ending the workflow execution. It works base on the function [IsApprovedFn](#basic-functions). If all `dataConditions` evaluates to false, we go
to the `defaultCondition` and we transition to the **"Finalization State"** or another Step State.
**Definition:**

```json
{
	"name": "Switch-RANDOMID",
	"type": "switch",
	"defaultCondition": {
		"transition": "Finalization State" // Name of the state to transition to
	},
	"dataConditions": [
		{
			"name": "Step Approved",
			"condition": "${ fn:IsApprovedFn }",
			"transition": "Step-RANDOMID"
		}
	]
}
```

#### Basic Finalization State

This state is reponsible for performing operations that indicates that the workflow has ended. Currently it only injects the static data `{end: true}` into state data input. This `end` property is picked up by the `Dispatcher` (lambda application found at apps/dispatcher) and then the transaction status is set accordingly.

## FAQ

### What is the difference between Step and State?

As we know, the workflow definition is made of states and each state has a type (such as 'operation', 'switch', 'inject', etc...). An Step in the Workflow is a State that we are requesting for Datasources or validating the rules based on those datasources. So with that we can say that every Step is a State but not every State is a Step.
