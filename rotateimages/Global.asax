<%@ Application Language="C#" %>

<script runat="server">

    protected void Application_BeginRequest()
    {

        string[] allowedOrigin = new string[] { "http://localhost:1337" };
        var origin = HttpContext.Current.Request.Headers["Origin"];

        if (origin != null && allowedOrigin.Contains(origin))
        {
            HttpContext.Current.Response.AddHeader("Access-Control-Allow-Origin", origin);
            HttpContext.Current.Response.AddHeader("Access-Control-Allow-Headers", "X-Requested-With");
            HttpContext.Current.Response.AddHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS,PUT");
        }
    }

    void Application_Start(object sender, EventArgs e)
    {
 
    }

    void Application_End(object sender, EventArgs e)
    {
        //  Code that runs on application shutdown

    }

    void Application_Error(object sender, EventArgs e)
    {
        // Code that runs when an unhandled error occurs

    }

    void Session_Start(object sender, EventArgs e)
    {
        // Code that runs when a new session is started

    }

    void Session_End(object sender, EventArgs e)
    {
        // Code that runs when a session ends. 
        // Note: The Session_End event is raised only when the sessionstate mode
        // is set to InProc in the Web.config file. If session mode is set to StateServer 
        // or SQLServer, the event is not raised.

    }

</script>
