<%@ WebHandler Language="C#" Class="getimage" %>

using System;
using System.Web;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.IO;
using System.Text;
using System.Threading.Tasks;

public class getimage : IHttpHandler {

    private void ValidateRequest(HttpRequest request)
    {
        if (null == request["content"])
        {
            throw new ArgumentNullException("content");
        }

        try
        {
            var imageBytes = Convert.FromBase64String(request["content"].Replace("data:image/png;base64,",""));

        }
        catch (Exception ex)
        {

            throw ex;
        }

    }
    public void ProcessRequest(HttpContext context)
    {
        ValidateRequest(context.Request);

        //context.Response.ContentType = "application/json";
        context.Response.ContentType = "text/json";
        var imageBytes = Convert.FromBase64String(context.Request["content"].Replace("data:image/png;base64,", ""));
        var ms = new MemoryStream(imageBytes, 0, imageBytes.Length);
        Image image = Image.FromStream(ms, true);

        var bmp = RotateImage(image, 90);
        var base64String = getBase64String(bmp);

        var result = Newtonsoft.Json.JsonConvert.SerializeObject(
            new { image = base64String }
        );

        context.Response.Write(result);
        //context.Response.SetCookie(new HttpCookie("1121212"));
        context.Response.End();

        //bmp.Save(context.Response.OutputStream,System.Drawing.Imaging.ImageFormat.Jpeg);
        //}
    }

    public string getBase64String(Image image)
    {


        ImageConverter converter = new ImageConverter();
        var imageBytes = (byte[])converter.ConvertTo(image, typeof(byte[]));
        string base64String = Convert.ToBase64String(imageBytes);
        return base64String;

        //using (MemoryStream m = new MemoryStream())
        //{
        //    image.Save(m, image.RawFormat);
        //    byte[] imageBytes = m.ToArray();

        //    string base64String = Convert.ToBase64String(imageBytes);
        //    return base64String;
        //}


    }
    public static Image RotateImage(Image img, float rotationAngle)
    {
        Bitmap bmp = new Bitmap(img.Height, img.Width);
        bmp.SetResolution(img.HorizontalResolution, img.VerticalResolution);
        Graphics gfx = Graphics.FromImage(bmp);
        gfx.TranslateTransform((float)bmp.Width / 2, (float)img.Height / 2);
        gfx.RotateTransform(rotationAngle);
        gfx.TranslateTransform(-(float)bmp.Width / 2, -(float)img.Height / 2);
        gfx.InterpolationMode = InterpolationMode.HighQualityBicubic;
        gfx.DrawImage(img, new Point(0, 0));
        gfx.Dispose();
        return (Image)bmp;
    }

    public bool IsReusable {
        get {
            return false;
        }
    }

}