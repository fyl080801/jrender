# 说明

只是一个实验性项目

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
    "on": { "input": "$:(e)=>UPDATE(model, 'obj.text', e)" }
  }
}
```

定义一个处理 formItem 的方法

```javascript
const onSetup = ({ onBeforeRender }) => {
  onBeforeRender((field) => {
    if (!field.formItem) {
      return field;
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
  <el-input :value="model.obj.text" @input="(e)=>UPDATE(model, 'obj.text', e)" />
</el-form-item>
```
