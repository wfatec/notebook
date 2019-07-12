<!-- TOC -->

- [前端数据加密](#前端数据加密)
    - [对称加密](#对称加密)
    - [非对称加密](#非对称加密)
    - [实际方案](#实际方案)
        - [RSA 加密](#rsa-加密)
        - [AES 加密](#aes-加密)
        - [RSA 解密](#rsa-解密)
        - [AES 解密](#aes-解密)

<!-- /TOC -->

# 前端数据加密

在生产环境中，有很多的场景对于数据传输的安全性有着比较高的要求，例如金融行业等数据敏感型企业尤为如此。因此，对于常常作为信息发起角色的前端，一套相对靠谱的加密方案就显得尤为重要。接下来我就结合工作中的实践经验，进行一些简单的梳理。

## 对称加密

对称加密是一种较为常见的加密方式，特点是加密和解密双方使用相同的密钥进行加密和解密。

- **优点**：运算速度快
- **缺点**：安全性取决于密钥本身，一旦密钥丢失，则形同虚设

对于前端来讲，很难实现安全的保存密钥，因此单纯使用对称加密的方式显然是不可取的。

## 非对称加密

顾名思义，非对称加密在加密和解密时使用的是不同的密钥，即**公钥(publickey)**和**私钥(privatekey)**。公钥和私钥是配对的，具有一一对应的关系，如果使用公钥进行加密，则只能使用对应得到私钥才能进行解密，这样的特性很好的解决了密钥的安全性问题，因为我们将无需进行密钥的交换。

- **优点**：保密性好，无需交换密钥
- **缺点**：算法复杂，解密解密比较耗费性能，不适合加密长数据

可见非对称加密虽然解决了密钥的安全性问题，但是却会对性能产生一定的影响。那么我们如何来“取其精华，去其糟粕”呢？

## 实际方案

通过上述分析，我们大体明白了两种加密方式的优缺点，因此我们在工程实践过程中将对两者进行结合，从而兼顾效率和安全性。具体分为如下步骤：

**加密过程**：

1. 生成 32 位随机数作为对称加密密钥 key
2. 通过 RSA 算法使用公钥 publickey 对 key 进行加密，获取 512 位的密文 encryptoKey
3. 使用 AES 对称加密算法对传输数据 data 进行对称加密，获取密文 encryptoData
4. 将两者进行拼接，即为完整的传输密文

**解密过程**：

1. 截取密文串，使用私钥 privatekey 对前 512 位字符串进行 RSA 解密，获取对称密钥 key
2. 使用 key 对剩余密文串进行 AES 解密，即可获取传入的 data 数据

是不是很 easy 呢？不过子实践过程中仍然会有一些具体细节需要注意，下面将对 RSA 和 AES 的具体实现过程进行介绍。

### RSA 加密

当时寻找 RSA 加密的工具着实还费了一番功夫，最终我选择了 [node-rsa](https://github.com/rzcoder/node-rsa)。

```ts
export const RSAEncrypto: (key: string) => string = key => {
  // 导入公钥
  const publicKey = new RSA(PUBLICKKEY, "pkcs8-public");
  // 设置 padding 模式为 pks1，默认为 pkcs1_oaep
  publicKey.setOptions({
    encryptionScheme: "pkcs1"
  });
  // 这里使用 16 进制编码方式
  return publicKey.encrypt(key, "hex");
};
```

初始化 RSA 的格式化字符串为：`scheme-[key_type]-[output_type]`

scheme 主要有 `pkcs1` 和 `pkcs8` 两种：

- `pkcs1`：公钥以`-----BEGIN RSA PUBLIC KEY-----`为 `header`，私钥以`-----BEGIN RSA PRIVATE KEY-----`为 `header`
- `pkcs8`：公钥以`-----BEGIN PUBLIC KEY-----`开头为 `header`，私钥以`-----BEGIN PRIVATE KEY-----`为 `header`

key_type 主要有 `private` 和 `public` 两种，默认为 `privte`

output_type 主要有 `pem` 和 `der` 两种，`pem` 为默认值：

- `pem`：Base64 编码的字符串，且具有 `headr` 和 `footer`
- `pem`：二进制编码

### AES 加密

AES 的实现主要基于较为流行的 [crypto-js](https://github.com/brix/crypto-js)。

```ts
export const AESEncrypto: (key: string, data: any, iv: string) => string = (
  key,
  data,
  iv
) => {
  const utf8iv = CryptoJS.enc.Utf8.parse(iv); // 对偏移量进行 utf8 编码
  const baseKey = CryptoJS.enc.Utf8.parse(key); // 对密钥进行 utf8 编码
  const data2string = JSON.stringify(data);
  // 对 body 数据进行 AES 加密，并输出 16 进制密文
  const encryptData = CryptoJS.AES.encrypt(data2string, baseKey, {
    iv: utf8iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  }).ciphertext.toString();

  return encryptData;
};
```

### RSA 解密

```ts
export const RSADecrypto: (
  encryptoString: string
) => string = encryptoString => {
  // 导入公钥
  const private = new RSA(PRIVATEKEY, "pkcs8-private");
  // 设置 padding 模式为 pks1，默认为 pkcs1_oaep
  private.setOptions({
    encryptionScheme: "pkcs1"
  });
  // 这里使用 16 进制编码方式
  return privateKey.decrypt(Buffer.from(encryptoString, "hex")).toString();
};
```

**注意**：在进行解密时，需要将密文字符串转化为 Buffer 类型

### AES 解密

```ts
export const AESDecrypto: (
  key: string,
  encryptoString: string,
  iv: string
) => string = (key, encryptoString, iv) => {
  // 将密文转为 16 进制 buffer
  const encryptedHexStr = CryptoJS.enc.Hex.parse(encryptoString);
  // 转为 base64 编码字符串
  const encryptedBase64Str = CryptoJS.enc.Base64.stringify(encryptedHexStr);
  // AES 解密
  const decryptData = CryptoJS.AES.decrypt(encryptedBase64Str, baseKey, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  // 返回 JSON 字符串
  return decryptData.toString(cryptoUtf8).toString();
};
```
