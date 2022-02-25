# 说明

基于 `vue2` 的界面渲染库

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
  "events": {
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
  "props": { "value": "$:model.obj.text", "placeholder": "input value" },
  "events": { "input": "$:(e)=>SET(model, 'obj.text', e)" }
}
```

定义一个处理 formItem 的方法

```javascript
const onSetup = ({ onBeforeBind }) => {
  onBeforeBind(() => (field, next) => {
    if (!field.formItem) {
      next(field);
      return;
    }

    const formItem = field.formItem;

    delete field.formItem;

    return { component: "el-form-item", props: formItem, children: [field] };
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
    label: checked
  props:
    value: $:GET(model, 'checked') # GET 深度获取值
  events:
    input: $:(e)=>SET(model, 'checked', e) # 深度设置值
```

可使用 addFunction 添加自定义功能函数

```javascript
import { nextTick } from "@vue/composition-api";

useRootRender(({ addFunction }: any) => {
  addFunction("NEXTTICK", (cb: any) => {
    nextTick(cb);
  });
});
```

支持设置监听，实现数据发生变化后触发操作

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
