import { FormGroup, FormControl, FormGroupDirective, NgForm, ValidatorFn, AbstractControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

export class CustomValidators {
    /**
     * Validates that child controls in the form group are equal
     */
    static childrenEqual: ValidatorFn = (control: AbstractControl) => {
        const [firstControlName, ...otherControlNames] = Object.keys((control as FormGroup).controls || {});
        const isValid = otherControlNames.every(controlName => control.get(controlName)?.value === control.get(firstControlName)?.value);
        return isValid ? null : { childrenNotEqual: true };
    }
}

/**
 * Custom ErrorStateMatcher which returns true (error exists) when the parent form group is invalid and the control has been touched
 */
export class ConfirmValidParentMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        return control!.parent!.invalid && control!.touched;
    }
}