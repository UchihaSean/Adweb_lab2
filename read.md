# Web GL 学习与实践
### WebGL 介绍
WebGL是一种3D绘图标准，这种绘图技术标准允许把JavaScript和OpenGL ES 2.0结合在一起，通过增加OpenGL ES 2.0的一个JavaScript绑定，WebGL可以为HTML5 Canvas提供硬件3D加速渲染，这样Web开发人员就可以借助系统显卡来在浏览器里更流畅地展示3D场景和模型了，还能创建复杂的导航和数据视觉化。显然，WebGL技术标准免去了开发网页专用渲染插件的麻烦，可被用于创建具有复杂3D结构的网站页面，甚至可以用来设计3D网页游戏等等。

### 3D场景与贴图
##### 绘制三维立体图形
- 三维物体和二维图形最显著的区别就是，三维物体具有深度，也就是Z轴。但是，我们还是得把三维场景绘制到二维屏幕上，而观察者可以处在任意位置观察，所以得定义观察者的视点、上方向和观察目标点（如图所示）  
![alt text](https://github.com/UchihaSean/Adweb_lab2/blob/master/img/1.png)


 > 视点：观察者所在三维空间的位置，视线的起点   
 > 观察目标点：被观察目标所在的点  
 > 上方向：最终绘制到品目上的影像中的向上的方向
 >  Matrix4.setLookAt(eyeX,eyeY,eyeZ,atX,atY,atZ,upX,upY,upZ) 为设置视点、观察目标点和上方向的函数

- 虽然你可以将三维物体放在三维空间中任何地方，但是只有当它在可视范围内时，WebGL才会绘制它
 > 可视空间：长方体可视空间、金字塔可视空间   
 > 定义长方体可视空间函数  
 > Matrix4.setOrtho(left,right,bottom,top,near,far)

- 可视空间是具有深度感的，所以近大远小  
![alt text](https://github.com/UchihaSean/Adweb_lab2/blob/master/img/2.png)
> 定义可视空间的投影矩阵  
> Matrix4.setPerspective(fov,aspect,near,far)

- 在真实世界中，如果将两个盒子一前以后放在桌上，前面的会挡住后面的，而WebGL在默认情况下是根据缓冲区的顺序绘制图形，所以会出现问题，这个时候需要隐藏面消除这个功能
- 通过顶点索引绘制立方体,我们将立方体拆成顶点和三角形，立方体被拆成六个面：前后左右上下，每个面都是由两个三角形构成，每个三角形和顶点列表中的三个顶点相关，通过这种方法建立顶点索引，如果要对颜色进行操作，也可以通过索引方式达成

### 纹理映射
   - 准备好映射到几何图形上的纹理图像
   - 为几何图形配置纹理映射方式
   - 加载纹理图像，对其进行一些配置，以在WebGL中使用它
   - 在片元着色器中将相应的纹素从纹理中抽取出来，并将纹素的颜色赋给片元
顶点着色器和片元着色器

![alt text](https://github.com/UchihaSean/Adweb_lab2/blob/master/img/13.png)  
> 监听纹理图像的加载事件，一旦加载完成，就在WebGL系统中使用纹理




### 载入复杂模型
![alt text](https://github.com/UchihaSean/Adweb_lab2/blob/master/img/3.png)   
> 实际应用中，不会像之前那样在代码中显式定义三维模型的顶点坐标，而是从模型文件中读取三维模型顶点坐标和颜色数据，而这些模型软件则是由三维建模软件生成的。

- 准备一个空的缓冲区对象  
![alt text](https://github.com/UchihaSean/Adweb_lab2/blob/master/img/4.png)   
- 读取OBJ文件中的内容   
![alt text](https://github.com/UchihaSean/Adweb_lab2/blob/master/img/5.png)   
- 解析  
![alt text](https://github.com/UchihaSean/Adweb_lab2/blob/master/img/6.png)  
- 解析出数据写入缓冲区  
![alt text](https://github.com/UchihaSean/Adweb_lab2/blob/master/img/12.png)  
- 绘制  
![alt text](https://github.com/UchihaSean/Adweb_lab2/blob/master/img/7.png)  

### 光照
> 光照类别：平行光，点光源光，环境光   
> 反射类型：漫反射，环境反射              

- 环境光和方向光  
![alt text](https://github.com/UchihaSean/Adweb_lab2/blob/master/img/8.png)  
- 模型变换和法向量   
![alt text](https://github.com/UchihaSean/Adweb_lab2/blob/master/img/9.png)  
- 逐片元光照   
![alt text](https://github.com/UchihaSean/Adweb_lab2/blob/master/img/10.png)  

### 实现
![alt text](https://github.com/UchihaSean/Adweb_lab2/blob/master/img/11.png)  
> 项目地址：https://github.com/UchihaSean/Adweb_lab2
> 注：本人未选过《计算机图形学》，但之前有买书自学过一段时间的WebGL，这次HW2于是就利用图形学的PJ3作为demo来学习和实践
