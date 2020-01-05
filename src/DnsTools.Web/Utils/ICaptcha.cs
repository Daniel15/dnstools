namespace DnsTools.Web.Utils
{
	public interface ICaptcha
	{
		bool IsValidatedInSession();
		void MarkValidInSession();
	}
}
