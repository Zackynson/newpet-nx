<details>
<summary>Commands and options</summary>
<br />

#### Deploy options

If your PR is targeting one of the [dev, beta, master] branches, you can choose to deploy everything or only the stuff affected by your PR. You can do so by setting the labels:

- `deploy:affected` will deploy only the affected changes (faster alternative).
- `deploy:all` will deploy everything (slower alternative).

> **NOTE: the `deploy:all` label has precedence over `deploy:affected`.**

#### Commands

You can trigger actions by commenting on this PR:

##### Command: `/cdk-diff`

> **CDK Diff: This command outputs the difference between the already deployed CloudFormation template and the CloudFormation template equivalent of our current CDK code.**

- `/cdk-diff affected` will output the difference of the affected stacks.
  - In case the `infra` project or `package-lock.json` was affected, this command has the same behaviour as the `all` option below.
- `/cdk-diff all` or `/cdk-diff` will output the difference of all stacks.

**Options:**

- `base`: Base branch to consider for Nx affected command.
- `head`: Head branch to consider for Nx affected command.
- `region`: Glob expression to match regions to deploy the stacks. The regions considered are the ones from the CDK Context. Only works for `affected` subcommand.
- `stack`: Glob expression to match stacks to deploy. Works for `affected` and `all` subcommand.

**Examples:**

```bash
/cdk-diff affected base=master~3 head=master # run diff for what is affected by the last 3 commit in master
/cdk-diff affected base=dev head=feat/super-feature # check what changes feat/super-feature will introduce into dev
/cdk-diff affected region=us-east-1 # run diff only for us-east-1 region
/cdk-diff affected region=us-east-* # run diff only for us-east-1 and us-east-2 region
/cdk-diff affected region=us-east-* stack=newpet-dev-*-Private* # run diff only for us-east-1 and us-east-2 region and for private dev stacks
```

⚠️ Warning: Please note that if you have `region` and `stack` properties and they are disjoint, you may not have your deploy run. For example, setting
`region=us-east-1` and `stack=newpet-dev-usEast2-*` will not work because the first tells to deploy only `us-east-1` stacks, but the filtered stacks are telling to deploy `us-east-2`. So in this case, nothing will happen.

<br>
##### Command: `/deploy`

This command will deploy the base-ref into it's corresponding stage (DEV, BETA or PROD) for the selected regions.

- `/deply affected` The same as the cdk-diff command, except this command will deploy the affected changes (not only comment the diff).
- `/deploy all` or `/deploy` will deploy all stacks and projects even if they were not touched.

**NOTE:** The STAGE will be derived from the real base branch of your PR and not from the `base` command argument. For example: If your PR is created with `beta ← feat/new-stuff` and you run `/deploy affected base=master head=feat/new-stuff` the target stage to deploy would still be **beta** because the base of your PR is the beta branch.

**Options:**

- `region`: Glob expression to match regions to deploy the stacks. The regions considered are the ones from the CDK Context.
- `stack`: Glob expression to match stacks to deploy. Works for `affected` and `all` subcommand.

```bash
/deploy # deploy to all regions in the CDK Context
/deploy affected region=us-east-1 stack=newpet-dev-*-Private*  # deploy the private affected stacks to us-east-1 only
/deploy region=us-east-* # deploy all stacks in us-east-1 and us-east-2 region (ONLY IF THE deploy:affected label is set)
/deploy region=us-east-* # deploy all stacks in us-east-1 and us-east-2 region
/deploy stack=newpet-dev-usEast1-ApiGatewayResourcesStack # deploy the ApiGatewayResourcesStack stack in the us-east-1 region
/deploy region=us-east-* # deploy all stacks in us-east-1 and us-east-2 region
```

#### ⚠️ Warnings

- You **SHOULD** rebase your branch before running the `/deploy` command. For more information on rebase please refer to [this documentation](https://git-scm.com/docs/git-rebase);
- You **CANNOT** run `/cdk-diff` or `/deploy` commands for regions that are not in the CDK Context. If you try to select regions that are not in the context, you will get an error;

</details>
