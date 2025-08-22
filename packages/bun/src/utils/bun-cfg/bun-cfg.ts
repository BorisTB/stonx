// @ts-ignore
Symbol['metadata'] ??= Symbol('Symbol.metadata');
// @ts-ignore
Symbol['dispose'] ??= Symbol('Symbol.dispose');
// @ts-ignore
Symbol['asyncDispose'] ??= Symbol('Symbol.asyncDispose');

function loggedMethod(headMessage = 'LOG:') {
  return function actualDecorator<This, Args extends any[], Return>(
    target: (this: This, ...args: Args) => Return,
    context: ClassMethodDecoratorContext<
      This,
      (this: This, ...args: Args) => Return
    >
  ) {
    const methodName = String(context.name);

    function replacementMethod(this: This, ...args: Args): Return {
      console.log(`LOG: Entering method '${methodName}'.`);
      const result = target.call(this, ...args);
      console.log(`LOG: Exiting method '${methodName}'.`);
      return result;
    }

    return replacementMethod;
  };
}
function argv<This, Value>(flag = 'LOG:') {
  return function actualDecorator(
    target: any,
    context: ClassFieldDecoratorContext<This, Value>
  ) {
    context.metadata[context.name] = flag;
  };
}

export class Fooha {
  @argv('asd')
  value: boolean = true;
  @loggedMethod('aaa')
  hello() {
    return 'hello';
  }
}

Symbol.metadata;
