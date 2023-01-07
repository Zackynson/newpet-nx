/**
 * Checks if the stack id is valid by checking if it ends with the class name.
 *
 * This validation is important for the deployment pipeline because the assumption
 * is that the id is the same as the Stack Class name.
 *
 * You can check scripts/cdk-class-to-project.ts to see why this validation must be set.
 *
 * @param id Stack id passend via constructor
 * @param stackClassName Stack Class name
 * @returns boolean Indicates if the stack is valid or not
 */
export function isValidStackId(id: string, stackClassName: string): boolean {
	const regExp = new RegExp(stackClassName + '$');
	return regExp.test(id);
}
