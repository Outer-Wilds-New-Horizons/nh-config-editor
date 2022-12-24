/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Form from "@rjsf/core/lib/components/Form";

// Ok this file is terrible, I know, but also... it works.........

type FormState = {
    schema: any;
    uiSchema: any;
    idSchema: any;
    formData: any;
    edit: boolean;
    errors: any;
    errorSchema: any;
    additionalMetaSchemas: any;
};

export default class FormNoDefaults extends Form {
    getStateFromProps(props: any, inputFormData: any): FormState {
        const resultState = super.getStateFromProps(props, inputFormData);
        resultState.formData = inputFormData ?? {};
        return resultState;
    }
}
