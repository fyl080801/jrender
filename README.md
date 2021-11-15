# 说明

只是一个实验性项目，由于某些原因 vue2 的需求还需要用

## 表达式

通过 `$:<path>` 将值绑定到属性上

```json
{
  "text": "$:model.text"
}
```

支持函数表达式

```json
{
  "on": {
    "click": "$:()=>{ alert('clicked') }"
  }
}
```

## 渲染前处理

通过定义渲染前处理实现改变将要渲染的节点功能

例如：原始定义如下

```json
{
  "component": "el-input",
  "formItem": { "label": "input" },
  "options": {
    "props": { "value": "$:model.obj.text" },
    "attrs": { "placeholder": "input value" },
    "on": { "input": "$:(e)=>SET(model, 'obj.text', e)" }
  }
}
```

定义一个处理 formItem 的方法

```javascript
const onSetup = ({ onBeforeRender }) => {
  onBeforeRender(() => (field, next) => {
    if (!field.formItem) {
      next(field);
      return;
    }

    const formItem = field.formItem;

    delete field.formItem;

    return { component: "el-form-item", options: { props: formItem }, children: [field] };
  });
};
```

输出结果

```html
<el-form-item label="input">
  <el-input :value="model.obj.text" @input="(e)=>SET(model, 'obj.text', e)" />
</el-form-item>
```

## 功能函数

可在表达式中使用功能函数

```yaml
- component: el-checkbox
  formItem:
    props:
      label: checked
  options:
    props:
      value: $:GET(model, 'checked') # GET 深度获取值
    on:
      input: $:(e)=>SET(model, 'checked', e) # 深度设置值
```

可使用 addFunction 添加自定义功能函数

```javascript
import { nextTick } from "vue-demi";

useRootRender(({ addFunction }: any) => {
  addFunction("NEXTTICK", (cb: any) => {
    nextTick(cb);
  });
});
```

```yaml
listeners:
  - watch: $:GET(model, 'arr', []).length
    actions:
      - handler: |
          $:() => {
            SET(model, 'checked', false); 
            NEXTTICK(() => { SET(model, 'checked', true) }); 
          }
```
