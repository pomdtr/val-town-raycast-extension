import { Action, ActionPanel, Detail, Form, Toast, getPreferenceValues, showToast, useNavigation } from "@raycast/api";
import { useEffect, useState } from "react";
import { fetch } from "cross-fetch";

function codeblock(code: string, language: string) {
  return "```" + language + "\n" + code + "\n```";
}

const { apiToken } = getPreferenceValues<Preferences>();

export default function EvalExpression(props: { arguments: Arguments.EvalExpression }) {
  const navigation = useNavigation();

  if (props.arguments.expression) {
    return <Val expression={props.arguments.expression} />;
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Evaluate"
            onSubmit={(values) => {
              navigation.push(<Val expression={values.expression} />);
            }}
          />
        </ActionPanel>
      }
    >
      <Form.TextArea id="expression" title="Expression" />
    </Form>
  );
}

function Val(props: { expression: string }) {
  const [markdown, setMarkdown] = useState<string>();
  useEffect(() => {
    fetch("https://api.val.town/v1/eval", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiToken,
      },
      body: JSON.stringify({
        code: props.expression,
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        setMarkdown(codeblock(JSON.stringify(json, null, 2), "json"));
      })
      .catch((err) => {
        showToast(Toast.Style.Failure, "Error", err);
      });
  }, []);

  return <Detail isLoading={typeof markdown == "undefined"} markdown={markdown} />;
}
